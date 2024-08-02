import { BaiduAuth } from '@/model/baidu/auth.ts';
import { requestGet, requestPost } from '..';

const BaiduDiskApiBaseUrl = 'https://pan.baidu.com';
const BaiduDiskRestApiBaseUrl = 'https://d.pcs.baidu.com/rest/2.0';

// 获取用户网盘容量
export async function getDiskQuotaAPI() {
  const token = await BaiduAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先进行百度授权' });

  return requestGet({
    url: `${BaiduDiskApiBaseUrl}/api/quota`,
    params: {
      access_token: token,
    },
  }, { useBg: true });
}

// 1.预上传
export async function preUploadAPI({
  path,
  size,
  isdir = 0,
  block_list,
}: {
  path: string;
  size: number;
  isdir: number;
  block_list: string[];
}) {
  const token = await BaiduAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先进行百度授权' });

  return requestPost({
    url: `${BaiduDiskApiBaseUrl}/rest/2.0/xpan/file`,
    params: {
      method: 'precreate',
      access_token: token,
    },
    data: {
      path,
      size,
      isdir,
      block_list,
      autoinit: 1,
    },
  }, { contentType: 'form', });
}

/* 2.分片上传 
    普通用户 单片4MB 单文件4GB
    普通会员 单片16MB 单文件10GB
    超级会员 单片32MB 单文件20GB
*/
export async function uploadSliceAPI({
  path,
  uploadid, // 预上传回传的id
  partseq = 0, // 分片序号
  file, // 文件内容char[]
}: {
  path: string;
  uploadid: string;
  partseq: number;
  file: string[];
}) {
  const token = await BaiduAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先进行百度授权' });

  return requestPost({
    url: `${BaiduDiskRestApiBaseUrl}/pcs/superfile`,
    params: {
      method: 'upload',
      access_token: token,
      type: 'tmpfile',
      path,
      uploadid,
      partseq,
      file,
    },
  }, { useBg: true, contentType: 'form' });
}

// 3.创建文件
export async function createFile({
  path,
  size,
  isdir = 0,
  block_list,
  uploadid,
}: {
  path: string;
  size: number;
  isdir: number;
  block_list: string[];
  uploadid: string;
}) {
  const token = await BaiduAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先进行百度授权' });

  return requestPost({
    url: `${BaiduDiskApiBaseUrl}/rest/2.0/xpan/file`,
    params: {
      method: 'create',
      access_token: token,
    },
    data: {
      path,
      size,
      isdir,
      block_list,
      uploadid,
    },
  }, { useBg: true, contentType: 'form' });
}

// 单步上传 limit: 2G
export async function uploadSingleFileAPI({
  path,
  ondup = 'newcopy',
  file, // 文件内容base64
}: {
  path: string;
  ondup?: 'fail' | 'overwrite' | 'newcopy';
  file: any;
}) {
  const token = await BaiduAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先登录百度云盘并授权' });

  return requestPost({
    url: `${BaiduDiskRestApiBaseUrl}/pcs/file`,
    params: {
      method: 'upload',
      access_token: token,
      path,
      ondup,
    },
    data: { file },
  }, { useBg: true, contentType: 'file' });
}
