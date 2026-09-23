import axios from 'axios';
import config from '../lib/config';
import Router from 'next/router';
import getFlag from './getFlag';
let _csrf = '';

const getFullUrl = (apiSite, fullUrl) => {
  return config.publicRuntimeConfig.backend.apiFormat.replace(/\{0\}/g, apiSite).replace(/\{1\}/g, fullUrl);
}

const getBaseUrl = () => {
  return config.publicRuntimeConfig.backend.baseUrl;
}

// No proxy regardless cause there's nothing for it anyway
const getUrlWithProxy = (url) => {
  // The configured apiFormat already uses /apisite/. Only add the prefix
  // for legacy absolute/relative /v1 URLs that are not already under /apisite/.
  const useApiSitePrefix = getFlag('UseApiSitePrefix', true);
  if (!useApiSitePrefix || typeof url !== 'string')
    return url;

  if (url.includes('/apisite/'))
    return url;

  if (url.startsWith('/v1'))
    return '/apisite' + url;

  if (url.includes('://')) {
    try {
      const parsed = new URL(url);
      if (parsed.pathname.startsWith('/v1')) {
        parsed.pathname = '/apisite' + parsed.pathname;
        return parsed.toString();
      }
    } catch (_) {
      // Leave malformed URLs unchanged; axios will report the real error.
    }
  }

  return url;
}

const shouldRedirect = (path) => {
  const noRedir = [
/*     '/catalog',
    '/users',
    '/games', */
	'/My/GroupAdmin.aspx'
  ];
  
  return !noRedir.some(noRedirectPath => 
    path.startsWith(noRedirectPath)
  );
}

const request = async (method, url, data) => {
  const isBrowser = typeof window !== 'undefined';
  try {
    let headers = {
      'x-csrf-token': _csrf,
    }
    if (!isBrowser) {
      // Auth header, if required
      const authHeaderValue = config.serverRuntimeConfig.backend.authorization;
      if (typeof authHeaderValue === 'string')
        headers[config.serverRuntimeConfig.backend.authorizationHeader || 'authorization'] = authHeaderValue;
      // Custom user agent
      headers['user-agent'] = 'Roblox2016/1.0';
    }
    const result = await axios.request({
      method,
      url: getUrlWithProxy(url),
      data: data,
      headers: headers,
      maxRedirects: 0,
      withCredentials: true,
    });
    return result;
  } catch (e) {
    if (e.response) {
      let resp = e.response;

      // Handle CSRF
      if (resp.status === 403 && resp.headers['x-csrf-token']) {
        _csrf = resp.headers['x-csrf-token'];
        return await request(method, url, data);
      }

/*    // Unauthorized
      if (resp.status === 401 && isBrowser) {
        const currentPath = window.location.pathname;
        if (currentPath !== '/logout' && shouldRedirect(currentPath)) {
          Router.push('/logout');
        }
        throw new Error('Unauthorized');
      } */
    }

    if (isBrowser) {
      if (e.response) {
        if (e.response.data && e.response.data.errors && e.response.data.errors.length) {
          let err = e.response.data.errors[0];
          e.message = e.message + ': ' + (err.code + ': ' + err.message);
        }
      }
      throw e;
    } else {
      throw new Error(e.message);
    }
  }
}

export default request;

export {
  getFullUrl,
  getBaseUrl,
  getUrlWithProxy,
}