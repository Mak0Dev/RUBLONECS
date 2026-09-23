# Roblox backend — direct signup / Wayback-style landing page

Changes:
- `/auth/signup` and `/signup` are now direct registration pages; no applicationId or inviteId is required.
- Signup validates username/password/password confirmation, birthday and gender.
- hCaptcha is required and verified server-side with the existing HCaptcha configuration.
- Successful registration creates a normal user and session, then redirects to `/home`.
- The signup page recreates the supplied 2016 Wayback Machine landing-page layout and uses the supplied local image assets.
- Added local static mapping `/legacy-signup-assets`.
- Removed the applicationId handling from the normal login flow.

Note: the older Application/Invite database/service code is still present elsewhere in the source because other admin/invite/password-recovery code references it. The public signup/authentication flow no longer depends on an Application.
