using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Roblox.Dto.Users;
using Roblox.Exceptions;
using Roblox.Libraries.Captcha;
using Roblox.Logging;
using Roblox.Models.Users;
using Roblox.Services;
using Roblox.Services.App.FeatureFlags;
using Roblox.Services.Exceptions;
using Roblox.Website.Controllers;

namespace Roblox.Website.Pages.Auth;

public class Signup : RobloxPageModel
{
    private const string BadCaptchaMessage = "Your captcha could not be verified. Please try again.";
    private const string RateLimitSecondMessage = "Too many attempts. Try again in a few seconds.";
    private const string RateLimitMinutesMessage = "Too many attempts. Try again in 5 minutes.";

    private static readonly Regex UsernameFormatRegex =
        new Regex(@"^[A-Za-z0-9]+(?:_[A-Za-z0-9]+)?$", RegexOptions.CultureInvariant);

    private static readonly string[] BlockedUsernameWords =
    {
        "nigga", "nigger", "fuck", "fucker", "fucking", "motherfucker",
        "bitch", "bitches", "shit", "shitty", "asshole", "dick", "dicks",
        "pussy", "cunt", "whore", "slut", "fag", "faggot", "retard",
        "porn", "hentai", "rape", "pedophile", "pedo"
    };

    private static bool IsUsernameAllowed(string value)
    {
        if (value.Length < 3 || value.Length > 21) return false;
        if (!UsernameFormatRegex.IsMatch(value)) return false;
        var normalized = value.ToLowerInvariant();
        if (normalized.Count(c => c == '_') > 1) return false;
        return !BlockedUsernameWords.Any(word => normalized.Contains(word, StringComparison.Ordinal));
    }

    [BindProperty]
    public string? username { get; set; }

    [BindProperty]
    public string? password { get; set; }

    [BindProperty]
    public string? passwordConfirm { get; set; }


    [FromForm(Name = "h-captcha-response")]
    public string? hCaptchaResponse { get; set; }

    public string siteKey => Roblox.Configuration.HCaptchaPublicKey;
    public string? errorMessage { get; set; }
    public bool signupDisabled { get; set; }

    public void OnGet()
    {
        FeatureCheck();
    }

    private void FeatureCheck()
    {
        try
        {
            FeatureFlags.FeatureCheck(FeatureFlag.SignupEnabled);
        }
        catch (RobloxException)
        {
            errorMessage = "Signup is disabled at this time. Try again later.";
            signupDisabled = true;
        }
    }

    public async Task<IActionResult> OnPost()
    {
        FeatureCheck();
        if (signupDisabled)
            return new PageResult();

        if (string.IsNullOrWhiteSpace(username))
        {
            errorMessage = "Please enter a username.";
            return new PageResult();
        }

        if (string.IsNullOrEmpty(password))
        {
            errorMessage = "Please enter a password.";
            return new PageResult();
        }

        if (password != passwordConfirm)
        {
            errorMessage = "Passwords do not match.";
            return new PageResult();
        }

        // Captcha is optional for private Karblox servers.

        var ip = Roblox.Website.Controllers.ControllerBase.GetIP(Roblox.Website.Controllers.ControllerBase.GetRequesterIpRaw(HttpContext));

        try
        {
            await services.cooldown.CooldownCheck("signup:step1:" + ip, TimeSpan.FromSeconds(5));
        }
        catch (CooldownException)
        {
            errorMessage = RateLimitSecondMessage;
            return new PageResult();
        }

        if (!string.IsNullOrWhiteSpace(hCaptchaResponse))
        {
            if (!await HCaptcha.IsValid(Roblox.Website.Controllers.ControllerBase.GetRequesterIpRaw(HttpContext), hCaptchaResponse))
            {
                errorMessage = BadCaptchaMessage;
                Roblox.Metrics.UserMetrics.ReportCaptchaFailure(Roblox.Metrics.UserMetrics.CaptchaFailureType.Signup);
                return new PageResult();
            }
        }

        if (!IsUsernameAllowed(username))
        {
            errorMessage = "Invalid Username. Use 3-21 characters: letters and numbers, with at most one underscore (_). The underscore cannot be first or last, spaces are not allowed, and inappropriate words cannot be used.";
            return new PageResult();
        }

        var usernameValid = await services.users.IsUsernameValid(username);
        if (!usernameValid)
        {
            errorMessage = "Invalid Username. Please use 3-21 letters/numbers with at most one underscore (_), not at the beginning or end.";
            return new PageResult();
        }

        // Username availability must be checked case-insensitively.
        // This prevents bypassing an existing name by changing its capitalization
        // (for example, "Builderman" vs "builderman" vs "BUILDERMAN").
        var normalizedUsername = username.Trim();

        if (!await services.users.IsNameAvailableForSignup(normalizedUsername))
        {
            errorMessage = "Username is already taken. Usernames are not case-sensitive.";
            return new PageResult();
        }

        if (!services.users.IsPasswordValid(password))
        {
            errorMessage = "Password is too simple.";
            return new PageResult();
        }

        var signupFinalKey = "signup:step2:" + ip;
        try
        {
            await services.cooldown.CooldownCheck(signupFinalKey, TimeSpan.FromMinutes(5));
        }
        catch (CooldownException)
        {
            errorMessage = RateLimitMinutesMessage;
            return new PageResult();
        }

        UserId createdUser;
        try
        {
            createdUser = await services.users.CreateUser(username.Trim(), password);
        }
        catch (Exception ex)
        {
            await services.cooldown.ResetCooldown(signupFinalKey);
            errorMessage = "Account creation failed: " + ex.Message;
            return new PageResult();
        }

        // Keep the legacy join_application row populated for compatibility with older
        // parts of the backend, but the account is no longer required to pass an
        // application check before using the website.
        try
        {
            var applicationId = await services.users.CreateApplication(new Roblox.Dto.Users.CreateUserApplicationRequest
            {
                about = "Automatic signup",
                socialPresence = "",
                isVerified = false,
                verifiedUrl = null,
                verifiedId = null,
                verificationPhrase = "Automatic signup"
            });
            var joinId = await services.users.ProcessApplication(applicationId, 1, Roblox.Dto.Users.UserApplicationStatus.Approved);
            if (!string.IsNullOrEmpty(joinId))
                await services.users.SetApplicationUserIdByJoinId(joinId, createdUser.userId);
        }
        catch (Exception ex)
        {
            Writer.Info(Roblox.Logging.LogGroup.ApplicationSocial, "Could not create automatic join_application for new user {0}: {1}", createdUser.userId, ex.Message);
        }

        var sess = await services.users.CreateSession(createdUser.userId);
        var sessionCookie = Roblox.Website.Middleware.SessionMiddleware.CreateJwt(new Middleware.JwtEntry
        {
            sessionId = sess,
            createdAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
        });

        HttpContext.Response.Cookies.Append(
            Middleware.SessionMiddleware.CookieName,
            sessionCookie,
            new CookieOptions
            {
                Secure = true,
                Expires = DateTimeOffset.UtcNow.AddDays(364),
                IsEssential = true,
                Path = "/",
                SameSite = SameSiteMode.Lax,
            });

        return Redirect("/home");
    }
}