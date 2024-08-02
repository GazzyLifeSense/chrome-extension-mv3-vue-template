class CookieUtil {
  static get(name: string) {
    const cookieName = `${encodeURIComponent(name)}=`,
      cookieStart = document.cookie.indexOf(cookieName);
    let cookieValue: string | null = null;
    if (cookieStart > -1) {
      let cookieEnd = document.cookie.indexOf('; ', cookieStart);
      if (cookieEnd == -1) {
        cookieEnd = document.cookie.length;
      }
      cookieValue = decodeURIComponent(
        document.cookie.substring(cookieStart + cookieName.length, cookieEnd)
      );
    }
    return cookieValue;
  }
  static set(name: any, value: any, expires: Date, path: string, domain: string, secure: string) {
    let cookieText = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
    if (expires instanceof Date) {
      cookieText += `; expires=${expires.toUTCString()}`;
    }
    if (path) {
      cookieText += `; path=${path}`;
    }
    if (domain) {
      cookieText += `; domain=${domain}`;
    }
    if (secure) {
      cookieText += '; secure';
    }
    document.cookie = cookieText;
  }
  static unset(name: string, path: string, domain: string, secure: string) {
    CookieUtil.set(name, '', new Date(0), path, domain, secure);
  }
}

function getCookieValueFromStr(cookieStr: string, key: string) {
  let result = '';
  if (cookieStr && key) result = decodeURIComponent(getCookieFromStr(cookieStr)[key]);
  return result;
}

function getCookieFromStr(cookieStr: string) {
  const result: { [key:string]: any } = {};
  if (cookieStr) {
    cookieStr.split('; ').map((ele: string) => {
      const eles = ele.split('=');
      const key = eles[0];
      const value = eles[1];
      result[key] = decodeURIComponent(value);
    });
  }
  return result;
}

export { CookieUtil, getCookieValueFromStr, getCookieFromStr }