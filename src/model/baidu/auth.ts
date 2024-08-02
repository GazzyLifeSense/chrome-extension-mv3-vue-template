
import { checkKeysIncluded } from '@/utils/public.ts';
import { getLocal } from '@/utils/storage/localStorage.ts';
import { popupCenter } from '@/utils/window.ts';
import { message } from 'ant-design-vue';
import { requestGet } from '@/api/index.ts';

export class BaiduAuth {
  // 从https://pan.baidu.com/union/console/app获取
  // AppKey
  static clientID = '';
  // SecretKey
  static clientSecret = '';
  // 授权后跳转地址
  static redirectURL = 'xxx/login-success/?auth=baidu';

  // 交换访问令牌
  static async exchangeToken(code: string) {
    return new Promise(resolve => {
      requestGet({
        url: 'https://openapi.baidu.com/oauth/2.0/token',
        params: {
          code,
          client_id: this.clientID,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectURL,
          grant_type: 'authorization_code',
        },
      }, { useBg: true })
        .then((res: unknown) => resolve(res))
        .catch(() => resolve(null));
    });
  }

  // 刷新访问令牌
  static async refreshAccessToken(refreshToken: any) {
    return new Promise(resolve => {
      requestGet({
        url: 'https://openapi.baidu.com/oauth/2.0/token',
        params: {
          refresh_token: refreshToken,
          client_id: this.clientID,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        },
      })
        .then((res: unknown) => resolve(res))
        .catch(() => resolve(null));
    });
  }

  // 获取缓存token 过期自动刷新
  static async getToken() {
    let token;
    const BaiduAuthCachedObj: any = await getLocal('BaiduAuth');
    if (checkKeysIncluded(BaiduAuthCachedObj, ['access_token', 'refresh_token', 'expires'])) {
      // 访问令牌过期
      if (Date.now() > BaiduAuthCachedObj.expires) {
        // 刷新访问令牌
        await this.refreshAccessToken(BaiduAuthCachedObj.refresh_token).then((res: any) => {
          if (checkKeysIncluded(BaiduAuthCachedObj, ['access_token', 'expires_in'])) {
            token = res.access_token;
            // 刷新GoogleAuth缓存
            chrome.storage.local.set({
              GoogleAuth: Object.assign(BaiduAuthCachedObj, {
                access_token: res.access_token,
                expires_in: res.expires_in,
                expires: Date.now() + res.expires_in * 1000,
              }),
            });
          }
        });
      } else {
        token = BaiduAuthCachedObj.access_token;
      }
    } else {
      // 打开授权窗口
      this.openAuthPage();
      return;
    }
    if (!token) message.info('获取百度授权失败，请重新授权');
    return token;
  }

  // 唤出授权页面
  static openAuthPage(forceLogin?: undefined) {
    // 权限列表
    const scopes = ['basic', 'netdisk'];

    // 授权地址
    let authURL = 'http://openapi.baidu.com/oauth/2.0/authorize';
    authURL += `?client_id=${this.clientID}`;
    authURL += `&response_type=code`;
    authURL += `&redirect_uri=${encodeURIComponent(this.redirectURL)}`;
    authURL += `&scope=${encodeURIComponent(scopes.join(','))}`;
    authURL += `&display=popup`;
    authURL += `&qrcode=1`;
    forceLogin && (authURL += `&force_login=1`);
    popupCenter({ url: authURL, target: 'baiduAuth', w: 700, h: 500 });
  }
}
