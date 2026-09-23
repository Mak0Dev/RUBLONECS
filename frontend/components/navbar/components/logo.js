import React, { useEffect, useState } from "react";
import { createUseStyles } from "react-jss";
import { getTheme, themeType, getCustomTheme } from "../../../services/theme";
import NavigationStore from "../../../stores/navigation";

const useLogoStyles = createUseStyles({
  imgDesktop: {
    width: '118px',
    height: '30px',

    display: 'none',
    '@media(min-width: 1301px)': {
      display: 'block',
    },
  },
  imgMobile: {
    width: '30px',
    height: '30px',
    display: 'block',
    backgroundSize: '30px',
    '@media(min-width: 1301px)': {
      display: 'none',
    },
  },
  imgMobileWrapper: {
    marginLeft: '40px',
  },
  col: {
    maxWidth: '140px',
  },
  openSideNavMobile: {
    display: 'none',
    '@media(max-width: 1300px)': {
      display: 'block',
      float: 'left',
      height: '30px',
      width: '30px',
      cursor: 'pointer',
    },
  },
});
const Logo = () => {
  const s = useLogoStyles();
  const navStore = NavigationStore.useContainer();
  const [theme, setThemeState] = useState(getTheme());
  const [customLogo, setCustomLogo] = useState(getCustomTheme().logo);

  useEffect(() => {
    const update = () => {
      setThemeState(getTheme());
      setCustomLogo(getCustomTheme().logo);
    };
    window.addEventListener('rbx-custom-theme-changed', update);
    window.addEventListener('rbx-theme-changed', update);
    return () => {
      window.removeEventListener('rbx-custom-theme-changed', update);
      window.removeEventListener('rbx-theme-changed', update);
    };
  }, []);

  const desktopLogo = theme === themeType.custom && customLogo ? customLogo : '/img/rb_logo.png';
  const mobileLogo = theme === themeType.custom && customLogo ? customLogo : '/img/logo_rb.png';

  return <div className={`${s.col} col-2 col-lg-2`}>
    <div className={s.openSideNavMobile + ' icon-menu custom-menu-icon'} onClick={() => {
      navStore.setIsSidebarOpen(!navStore.isSidebarOpen);
    }}></div>
    <div className={s.imgDesktop} style={{ backgroundImage: `url("${desktopLogo}")`, backgroundSize: "118px 30px" }}></div>
    <div className={s.imgMobileWrapper}>
      <div className={s.imgMobile} style={{ backgroundImage: `url("${mobileLogo}")`, backgroundSize: "30px 30px" }}></div>
    </div>
  </div>
}

export default Logo;