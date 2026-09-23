const themeType = {
  obc2016: 'obc2016',
  light: 'light',
  custom: 'custom',
  default: 'light',
};

const CUSTOM_KEY = 'rbx_custom_theme_v1';

const defaultCustomTheme = {
  background: '#ffffff',
  surface: '#f2f2f2',
  primary: '#FFAA5A',
  secondary: '#393939',
  text: '#191919',
  link: '#0055b3',
  logo: '/img/rb_logo.png',
  backgroundImage: '',
  backgroundImageSize: 'cover',
  backgroundImageRepeat: 'no-repeat',
  backgroundImagePosition: 'center',
  sidebarBackground: '#f2f2f2',
  sidebarText: '#191919',
  sidebarIconColor: '#191919',
  sidebarDivider: '#c3c3c3',
  sidebarCountBackground: '#C15C3F',
  sidebarCountText: '#ffffff',
  chatBackground: '#ffffff',
  chatText: '#191919',
  chatHeaderBackground: '#c15c3f',
  chatHeaderText: '#ffffff',
  chatMessageSelfBackground: '#c15c3f',
  chatMessageSelfText: '#ffffff',
  chatMessageOtherBackground: '#d0d0d0',
  chatMessageOtherText: '#111111',
  chatBackgroundImage: '',
  chatBackgroundImageSize: 'cover',
  chatBackgroundImageRepeat: 'no-repeat',
  chatBackgroundImagePosition: 'center',
  upgradeBackground: '#c15c3f',
  upgradeText: '#ffffff',
  upgradeHoverBackground: '#FFAA5A',
  searchBackground: '#ffffff',
  searchText: '#191919',
  searchBorder: '#c3c3c3',
  searchIconColor: '#191919',
  searchSuggestionBackground: '#ffffff',
  searchSuggestionText: '#343434',
  searchSuggestionHover: '#FFAA5A',
  footerBackground: '#ffffff',
  footerText: '#B8B8B8',
  footerLink: '#0055b3',
  footerHover: '#191919',
  navbarText: '#ffffff',
  currencyIconColor: '#ffffff',
  settingsIconColor: '#ffffff',
  menuIconColor: '#ffffff',
  globalIconColor: '#191919',
  containerBackground: '#ffffff',
  containerText: '#191919',
  containerBorder: '#c3c3c3',
  containerShadow: 'none',
  catalogContainerBackground: '#ffffff',
  catalogContainerText: '#191919',
  catalogContainerBorder: '#c3c3c3',
  avatarContainerBackground: '#ffffff',
  avatarContainerText: '#191919',
  avatarContainerBorder: '#c3c3c3',
  settingsContainerBackground: '#ffffff',
  settingsContainerText: '#191919',
  settingsContainerBorder: '#c3c3c3',
  pageTitleColor: '#191919',
  buttonBackground: '#393939',
  buttonText: '#ffffff',
  buttonHoverBackground: '#FFAA5A',
  inputBackground: '#ffffff',
  inputText: '#191919',
  inputBorder: '#c3c3c3',
  iconColor: '#191919',
};

const isLocalStorageAvailable = (() => {
  if (typeof window === 'undefined') return false;
  try { return !!window.localStorage; } catch (_) { return false; }
})();

const getTheme = () => {
  if (!isLocalStorageAvailable) return themeType.default;
  const savedTheme = localStorage.getItem('rbx_theme_v1');
  // Migrate old Dark selections to the default light theme.
  if (savedTheme === 'dark') {
    localStorage.setItem('rbx_theme_v1', themeType.default);
    return themeType.default;
  }
  return Object.values(themeType).includes(savedTheme) ? savedTheme : themeType.default;
};

const getCustomTheme = () => {
  if (!isLocalStorageAvailable) return { ...defaultCustomTheme };
  try {
    const saved = JSON.parse(localStorage.getItem(CUSTOM_KEY) || '{}');
    return { ...defaultCustomTheme, ...saved };
  } catch (_) { return { ...defaultCustomTheme }; }
};

const setCustomTheme = (values) => {
  if (!isLocalStorageAvailable) return;
  const next = { ...defaultCustomTheme, ...getCustomTheme(), ...values };
  localStorage.setItem(CUSTOM_KEY, JSON.stringify(next));
  apply(themeType.custom);
};

const setTheme = (theme) => {
  if (!isLocalStorageAvailable || !Object.values(themeType).includes(theme)) return;
  localStorage.setItem('rbx_theme_v1', theme);
  apply(theme);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('rbx-theme-changed', { detail: theme }));
};

const applyCustomVariables = () => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const c = getCustomTheme();
  const kebab = key => key.replace(/[A-Z]/g, m => '-' + m.toLowerCase());

  Object.entries(c).forEach(([key, value]) => {
    if (typeof value === 'string') {
      root.style.setProperty(`--custom-${kebab(key)}`, value);
    }
  });

  // Images are exposed as CSS variables so the entire app updates without a reload.
  root.style.setProperty('--custom-background-image', c.backgroundImage ? `url("${c.backgroundImage}")` : 'none');
  root.style.setProperty('--custom-chat-background-image', c.chatBackgroundImage ? `url("${c.chatBackgroundImage}")` : 'none');
  root.style.setProperty('--custom-logo', c.logo ? `url("${c.logo}")` : 'none');
  root.style.setProperty('--custom-logo-url', c.logo || '');

  // Notify already-mounted React components (navbar/logo/etc.) that custom values changed.
  window.dispatchEvent(new CustomEvent('rbx-custom-theme-changed', { detail: c }));
};

const apply = (theme) => {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  Object.values(themeType).forEach(t => html.classList.remove(t));
  html.classList.add(theme);
  if (theme === themeType.custom) applyCustomVariables();
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('rbx-theme-changed', { detail: theme }));
};

if (isLocalStorageAvailable && typeof window !== 'undefined') apply(getTheme());

export { themeType, getTheme, setTheme, getCustomTheme, setCustomTheme, defaultCustomTheme };
