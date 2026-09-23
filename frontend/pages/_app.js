import '../styles/globals.css';
import '../styles/helpers/textHelpers.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// Roblox CSS
import '../styles/roblox/icons.css';
import Navbar from '../components/navbar';
import React, {useEffect, useState} from 'react';
import Head from 'next/head';
import Footer from '../components/footer';
import dayjs from '../lib/dayjs';
import NextNProgress from "nextjs-progressbar";
import LoginModalStore from '../stores/loginModal';
import AuthenticationStore from '../stores/authentication';
import NavigationStore from '../stores/navigation';
import { getTheme, themeType, getCustomTheme } from '../services/theme';
import MainWrapper from '../components/mainWrapper';
import GlobalAlert from '../components/globalAlert';
import ThumbnailStore from "../stores/thumbnailStore";
import getFlag from "../lib/getFlag";
import Chat from "../components/chat";

if (typeof window !== 'undefined') {
  console.log(String.raw`
      _______      _________      _____       ______     _
     / _____ \    |____ ____|    / ___ \     | ____ \   | |
    / /     \_\       | |       / /   \ \    | |   \ \  | |
    | |               | |      / /     \ \   | |   | |  | |
    \ \______         | |      | |     | |   | |___/ /  | |
     \______ \        | |      | |     | |   |  ____/   | |
            \ \       | |      | |     | |   | |        | |
     _      | |       | |      \ \     / /   | |        |_|
    \ \_____/ /       | |       \ \___/ /    | |         _
     \_______/        |_|        \_____/     |_|        |_|

     Keep your account safe! Do not paste any text here.

     If someone is asking you to paste text here then you're
     giving someone access to your account, your gear, and
     your ROBUX.
	`);
}

function RobloxApp({ Component, pageProps }) {
  // set theme:
  // jss globals apparently don't support parameters/props, so the only way to do a dynamic global style is to either append a <style> element, use setAttribute(), or append a css file.
  // @ts-ignore
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const applyPageTheme = () => {
      const body = document.body;
      const theme = getTheme();
      if (theme === themeType.custom) {
        const custom = getCustomTheme();
        body.style.backgroundColor = custom.background || '#fff';
        body.style.backgroundImage = custom.backgroundImage ? `url("${custom.backgroundImage}")` : 'none';
        body.style.backgroundSize = custom.backgroundImageSize || 'cover';
        body.style.backgroundRepeat = custom.backgroundImageRepeat || 'no-repeat';
        body.style.backgroundPosition = custom.backgroundImagePosition || 'center';
        body.style.backgroundAttachment = 'fixed';
        body.style.color = custom.text || '#191919';
      } else {
        const divBackground = theme === themeType.obc2016 ? 'url(/img/Unofficial/obc_theme_2016_bg.png) repeat-x #222224' : document.getElementById('theme-2016-enabled') ? '#e3e3e3' : '#fff';
        body.style.background = divBackground;
        body.style.backgroundAttachment = '';
        body.style.color = '';
      }
    };

    applyPageTheme();
    window.addEventListener('rbx-custom-theme-changed', applyPageTheme);
    return () => window.removeEventListener('rbx-custom-theme-changed', applyPageTheme);
  }, [pageProps]);

  return <div>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin={''} />
      <title>{pageProps.title || 'RUBLON'}</title>
      <link rel='icon' type="image/vnd.microsoft.icon" href='/favicon.ico' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />
    </Head>
    <AuthenticationStore.Provider>
      <LoginModalStore.Provider>
        <NavigationStore.Provider>
          <Navbar/>
        </NavigationStore.Provider>
      </LoginModalStore.Provider>
      <GlobalAlert />
      <MainWrapper>
        {getFlag('clientSideRenderingEnabled', false) ? <NextNProgress options={{showSpinner: false}} color='#fff' height={2} /> : null}
        <ThumbnailStore.Provider>
          <Component {...pageProps} />
          <Chat />
        </ThumbnailStore.Provider>
      </MainWrapper>
      <Footer/>
    </AuthenticationStore.Provider>
  </div>
}

export default RobloxApp;
