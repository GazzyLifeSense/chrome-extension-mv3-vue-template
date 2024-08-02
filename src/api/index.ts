import { getLocal, removeLocal } from '@/utils/storage/localStorage.ts';

export async function requestGet(fetchConfig: any, { useToken, useBg }:any = {}){
  const method = 'GET'
  let {
    url, headers, params, mode, cache
  } = fetchConfig

  // 处理URLParams
  if(params) url = handleURLParams(url, params)
  // 携带token
  if (useToken) await handleToken(headers)

  const config = { method, headers, mode, cache }
  return useBg ? 
    new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          act: 'GET',
          url,
          config
        }, resolve
      ) 
    }) : fetchController(url, config)
};

export async function requestPost(fetchConfig: any, { useToken, useBg, contentType }: any = {}){
  const method = 'POST'
  let {
    url, headers, mode, cache, params, body
  } = fetchConfig

  // 处理URLParams
  if(params) url = handleURLParams(url, params)
  // 携带token
  if (useToken) await handleToken(headers)
  // 处理contentType
  if(contentType) handleContentType(headers, contentType)
  // 处理data
  body = await handleData(headers, body)

  const config = { method, headers, params, body, mode, cache }
  return useBg ? 
    new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          act: 'POST',
          url,
          config
        }, resolve
      ) 
    }) : fetchController(url, config)
};

// 处理params
function handleURLParams(url: string, params: any){
  let splitUrl = url.split('?')
  const pureUrl = splitUrl[0]
  let searchParams = splitUrl?.[1] || ''
  Object.keys(params || {}).forEach((key: string, index)=>{
    searchParams += `${!index && !searchParams ? '' : '&'}${key}=${params[key]}`
  })
  return `${pureUrl}?${searchParams}`
}

// 处理token
async function handleToken(headers: any){
  let token: any;
  token = await getLocal('userToken');
  if (!token?.length) {
    await removeLocal(['info']);
    return Promise.resolve({ msg: '身份信息过期，请登录!' });
  }
  Object.assign(headers || {}, { token });
}

// 处理请求头内容格式
function handleContentType(headers: any, contentType: string){
  switch (contentType) {
    case 'post':
      headers = Object.assign(headers, { 'Content-type': 'application/json' });
      break;
    case 'form':
      headers = Object.assign(headers, { 'Content-type': 'application/x-www-form-urlencoded' });
      break;
    case 'file':
      headers = Object.assign(headers, { 'Content-type': 'multipart/form-data' });
      break;
  }
}

// 处理数据格式
async function handleData(headers: any, data: any){
  switch (headers?.['Content-type']) {
    case 'application/json':
      data = JSON.stringify(data);
      break;
    case 'multipart/form-data':
      const formDt = new FormData();
      const file = data?.file;

      if (typeof file == 'string') {
        // 将base64转为blob
        if (file?.includes('base64')) {
          const response = await fetch(data.file);
          const blob = await response.blob();
          formDt.append('file', blob);
        } else {
          // 将字符串转为blob
          const blob = new Blob([file]);
          formDt.append('file', blob);
        }
      }
      for (const prop in data) {
        if (prop == 'file') continue;
        formDt.append(prop, data[prop]);
      }
      data = formDt;
      break;
    default:
      // 对提交数据进行格式化为表单数据
      data = formData(data);
  }
  return data;
}


export function formData(data: any) {
  console.log(data)
  const isFormData = data instanceof FormData;
  let result: any = data;
  if (!isFormData) {
    result = Object.keys(data || {})
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  }
  return result;
}

export const fetchController = async(url: string, config: RequestInit | any)=>{
  try {
    // 发起请求
    const response = await fetch(url, config);
    
    // 响应后数据处理
    let res;
    if (response?.ok) {
      if(config?.headers?.['Content-Type'] == 'application/json'){
        try{
          res = await response.json()
        }catch(err){
          res = await response.text()
        }
      }else{ 
        res = await response.text()
      }
      return { status: true, res };
    }else{ 
      res = response.text() 
      return { status: false, res };
    }
  } catch (error) {
    return { status: false, res: error}
  }
}