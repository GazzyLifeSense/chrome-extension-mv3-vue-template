import { getDiskQuotaAPI, uploadSingleFileAPI } from '@/api/baidu/index.ts';
import { base64UriFromBlob } from '@/utils/img.ts';

export class BaiduUtil {
  // 获取网盘剩余容量MB
  static async getRemainMB() {
    return await new Promise(resolve => {
      getDiskQuotaAPI()
        .then((res: any) => {
          resolve((res.total - res.used) / 1024 / 1024);
        })
        .catch(() => resolve(-1));
    });
  }

  /**
   * 上传图片到百度网盘
   * 必填其一: 图片链接url、文件内容（Base64、Blob、ArrayBuffer）
   * 必填: 上传路径path、覆盖规则ondup
   **/
  static uploadImg({ url, path, ondup, fileContent }: { url?: string; path: string; ondup?: boolean; fileContent?: string | Blob | ArrayBuffer}) {
    return new Promise(async (resolve, reject) => {
      let base64;
      if (url) {
        base64 = await new Promise(resolve => {
          chrome.runtime.sendMessage({ act: 'FETCH_FILE', filetype: 'img', url }, resolve);
        });
      } else if (typeof fileContent == 'string' && fileContent.includes('base64')) {
        base64 = fileContent;
      } else if (fileContent instanceof Blob) {
        base64 = await base64UriFromBlob(fileContent);
      } else if (fileContent instanceof ArrayBuffer) {
        base64 = await base64UriFromBlob(new Blob([fileContent]));
      } else {
        reject({ status: false, msg: 'require at least one param between: url、fileContent' });
      }
      if (base64?.length && base64?.includes('base64')) {
        uploadSingleFileAPI({ path, ondup, file: base64 })
          .then((res: any) => {
            if (res?.size)
              resolve({ status: true, size: res.size, path: res?.path, fs_id: res?.fs_id });
            else resolve({ status: false, msg: res?.error_msg });
          })
          .catch((err: any) => reject({ status: false, msg: err?.params?.path || err }));
      } else {
        reject({ status: false, msg: 'invalid url or fileContent' });
      }
    });
  }
}
