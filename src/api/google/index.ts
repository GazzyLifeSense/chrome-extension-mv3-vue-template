
import { GoogleAuth } from '@/model/google/auth.ts';
import { requestGet, requestPost } from '@/api/index.ts';

const GoogleSheetApiBaseUrl = 'https://sheets.googleapis.com/v4';
const GoogleDriveApiBaseUrl = 'https://www.googleapis.com/drive/v3';

// 创建新的spreadsheet
export async function createNewSpreadsheet(title: string) {
  const token = await GoogleAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先进行谷歌授权' });

  return requestPost({
    url: `${GoogleSheetApiBaseUrl}/spreadsheets`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: {
      properties: { title },
    },
  });
}

// 获取所有未被删除的spreadsheet
export async function getGoogleSheetList() {
  const token = await GoogleAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先进行谷歌授权' });

  return requestGet({
    url: `${GoogleDriveApiBaseUrl}/files`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { q: "mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false" },
  });
}

// 追加数据到某个spreadsheet
export async function appendDataToGoogleSheet({
  data,
  spreadsheetId,
}: {
  data: any[][]; // 二维数组，每个数组为一行的数据集
  spreadsheetId: string; // 表格id
}) {
  // 范围A1:Z100
  const range = 'A1:Z100';
  const token = await GoogleAuth.getToken();
  if (!token) return Promise.reject({ msg: '请先进行谷歌授权' });
  return requestPost({
    url: `${GoogleSheetApiBaseUrl}/spreadsheets/${spreadsheetId}/values/${range}:append`,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: { valueInputOption: 'RAW' },
    data: {
      range,
      majorDimension: 'ROWS',
      values: data,
    },
  });
}
