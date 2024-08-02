
import { checkKeysIncluded } from '@/utils/public.ts';
import { getLocal } from '@/utils/storage/localStorage.ts';
import { popupCenter } from '@/utils/window.ts';
import { message } from 'ant-design-vue';
import { requestPost } from '../../api';

export class GoogleAuth {
  // 从https://console.cloud.google.com/apis/credentials/oauthclient获取
  // OAuth客户端Id
  static clientID = '';
  // OAuth客户端密钥
  static clientSecret = '';
  // 授权后跳转地址
  static redirectURL = 'xxx/login-success/?auth=google';

  // 交换访问令牌
  static async exchangeToken(code: string) {
    return new Promise(resolve => {
      requestPost({
        url: 'https://oauth2.googleapis.com/token',
        data: {
          code,
          client_id: this.clientID,
          client_secret: this.clientSecret,
          redirect_uri: this.redirectURL,
          grant_type: 'authorization_code',
        },
      }, { useBg: true, contentType: 'form' })
        .then((res: unknown) => resolve(res))
        .catch(() => resolve(null));
    });
  }

  // 刷新访问令牌
  static async refreshAccessToken(refreshToken: string) {
    return new Promise(resolve => {
      requestPost({
        url: 'https://oauth2.googleapis.com/token',
        data: {
          refresh_token: refreshToken,
          client_id: this.clientID,
          client_secret: this.clientSecret,
          grant_type: 'refresh_token',
        },
      }, { useBg: true, contentType: 'form' })
        .then((res: unknown) => resolve(res))
        .catch(() => resolve(null));
    });
  }

  // 获取缓存token 过期自动刷新
  static async getToken() {
    let token;
    const GoogleAuthCachedObj: any = await getLocal('GoogleAuth');
    if (checkKeysIncluded(GoogleAuthCachedObj, ['access_token', 'refresh_token', 'expires'])) {
      // 访问令牌过期
      if (Date.now() > GoogleAuthCachedObj.expires) {
        // 刷新访问令牌
        await this.refreshAccessToken(GoogleAuthCachedObj.refresh_token).then((res: any) => {
          if (checkKeysIncluded(GoogleAuthCachedObj, ['access_token', 'expires_in'])) {
            token = res.access_token;
            // 刷新GoogleAuth缓存
            chrome.storage.local.set({
              GoogleAuth: Object.assign(GoogleAuthCachedObj, {
                access_token: res.access_token,
                expires_in: res.expires_in,
                expires: Date.now() + res.expires_in * 1000,
              }),
            });
          }
        });
      } else {
        token = GoogleAuthCachedObj.access_token;
      }
    }
    if (!token) message.info('获取谷歌授权失败，请重新授权');
    return token;
  }

  // 唤出授权页面
  static openAuthPage() {
    // 权限列表
    const scopes = ['https://www.googleapis.com/auth/drive'];

    // 授权地址
    let authURL = 'https://accounts.google.com/o/oauth2/auth';
    authURL += `?client_id=${this.clientID}`;
    authURL += `&response_type=code`;
    authURL += `&redirect_uri=${encodeURIComponent(this.redirectURL)}`;
    authURL += `&scope=${encodeURIComponent(scopes.join(' '))}`;
    authURL += `&prompt=consent`;
    authURL += `&access_type=offline`;
    popupCenter({ url: authURL, target: '_blank', w: 400, h: 600 });
  }
}
