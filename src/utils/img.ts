import FileSaver from 'file-saver';
import { get, getExportFileName } from '@/utils/public.ts';

export function calculateImageSizes(params: any) {
  // 计算实际尺寸
  const canvasActual = params.enableCanvas ? params.canvas : null;
  const imgActual = handleImgActualSizes(params);

  // 计算预览尺寸
  const canvasWidth = get(params, 'canvas.width');
  const canvasHeight = get(params, 'canvas.height');
  const boxWidth = get(params, 'box.width');
  const boxHeight = get(params, 'box.height');
  const canvasAdaptive = params.enableCanvas
    ? handleAdaptiveSizes(canvasWidth, canvasHeight, boxWidth, boxHeight)
    : null;
  const imgAdaptive = handleImgAdaptiveSizes(
    imgActual,
    canvasActual,
    canvasAdaptive,
    params.box,
    params.enableCanvas
  );
  const result = { canvasAdaptive, canvasActual, imgAdaptive, imgActual };
  return result;
}
function handleImgActualSizes(params: any) {
  let result: any = null;
  const imgWidth = get(params, 'img.width');
  const imgHeight = get(params, 'img.height');
  const canvasWidth = get(params, 'canvas.width');
  const canvasHeight = get(params, 'canvas.height');
  if (imgWidth && imgHeight && canvasWidth && canvasHeight) {
    // 画布宽大于图片 & 画布高大于图片 & 画布宽小于图片 & 画布高小于图片
    let enlargeWidth, enlargeHeight, reduceWidth, reduceHeight;
    if (imgWidth !== canvasWidth)
      imgWidth > canvasWidth ? (reduceWidth = true) : (enlargeWidth = true);
    if (imgHeight !== canvasHeight)
      imgHeight > canvasHeight ? (reduceHeight = true) : (enlargeHeight = true);

    let actualWidth = imgWidth;
    let actualHeight = imgHeight;
    if (params.lockRatio) {
      // 锁定比例
      let lockWidth, lockHeight; // 锁定宽 & 锁定高
      const actualWidthRatio = imgWidth / canvasWidth;
      const actualHeightRatio = imgHeight / canvasHeight;
      actualWidthRatio > actualHeightRatio ? (lockWidth = true) : (lockHeight = true);
      const imgRatio = imgWidth / imgHeight;
      if ((reduceWidth || (enlargeWidth && params.allowEnlarge)) && lockWidth) {
        actualWidth = canvasWidth;
        actualHeight = (1 / imgRatio) * canvasWidth;
      }
      if ((reduceHeight || (enlargeHeight && params.allowEnlarge)) && lockHeight) {
        actualHeight = canvasHeight;
        actualWidth = imgRatio * canvasHeight;
      }
    } else {
      // 不锁定比例
      if (reduceWidth || (enlargeWidth && params.allowEnlarge)) actualWidth = canvasWidth;
      if (reduceHeight || (enlargeHeight && params.allowEnlarge)) actualHeight = canvasHeight;
    }
    actualWidth = Math.floor(actualWidth);
    actualHeight = Math.floor(actualHeight);
    if (actualWidth && actualHeight) result = { width: actualWidth, height: actualHeight };
  }
  return result;
}
function handleAdaptiveSizes(width: number, height: number, boxWidth: number, boxHeight: number) {
  let result: any = null;
  if (width && height && boxWidth && boxHeight) {
    let adaptiveWidth, adaptiveHeight;
    const adaptiveidthRatio = width / boxWidth;
    const adaptiveHeightRatio = height / boxHeight;
    const ratio = width / height;
    if (adaptiveidthRatio > adaptiveHeightRatio) {
      adaptiveWidth = boxWidth;
      adaptiveHeight = (1 / ratio) * boxWidth;
    } else {
      adaptiveHeight = boxHeight;
      adaptiveWidth = ratio * boxHeight;
    }
    adaptiveWidth = Math.floor(adaptiveWidth);
    adaptiveHeight = Math.floor(adaptiveHeight);
    if (adaptiveWidth && adaptiveHeight) result = { width: adaptiveWidth, height: adaptiveHeight };
  }
  return result;
}
function handleImgAdaptiveSizes(imgActual: any, canvasActual: any, canvasAdaptive: any, box: any, enableCanvas: any) {
  let result: any = null;
  let adaptiveWidth, adaptiveHeight;
  if (imgActual) {
    if (enableCanvas) {
      if (canvasActual && canvasAdaptive) {
        adaptiveWidth = (imgActual.width / canvasActual.width) * canvasAdaptive.width;
        adaptiveHeight = (imgActual.height / canvasActual.height) * canvasAdaptive.height;
      }
    } else {
      const imgAdaptive = handleAdaptiveSizes(
        imgActual.width,
        imgActual.height,
        box.width,
        box.height
      );
      if (imgAdaptive) {
        adaptiveWidth = imgAdaptive.width;
        adaptiveHeight = imgAdaptive.height;
      }
    }
    adaptiveWidth = Math.floor(adaptiveWidth);
    adaptiveHeight = Math.floor(adaptiveHeight);
    if (adaptiveWidth && adaptiveHeight) result = { width: adaptiveWidth, height: adaptiveHeight };
  }
  return result;
}

export function base64FromImageUrl(url: string, imgType?: string) {
  return new Promise((resolve, reject) => {
    if (url) {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.src = url;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0);
          const base64 = canvas.toDataURL(imgType); // 这里可以指定图像格式
          resolve(base64);
        } else {
          reject();
        }
      };
    } else {
      reject();
    }
  });
}

export function blobFromImage(params: any, imgType?: string) {
  return new Promise((resolve, reject) => {
    if (params.url) {
      const image = new Image();
      image.crossOrigin = 'Anonymous';
      image.src = params.url;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const imgWidth = params?.img?.width || image.width;
        const imgHeight = params?.img?.height || image.height;
        const canvasWidth = get(params, 'canvas.width');
        const canvasHeight = get(params, 'canvas.height');
        canvas.width = canvasWidth || imgWidth;
        canvas.height = canvasHeight || imgHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          if (canvasWidth && canvasHeight) {
            const backgroundColor = get(params, 'canvas.backgroundColor');
            if (backgroundColor) ctx.fillStyle = params.canvas.backgroundColor;
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);
          }
          // 计算绘制图像的位置，使其水平垂直居中
          const x = (canvas.width - imgWidth) / 2;
          const y = (canvas.height - imgHeight) / 2;
          ctx.drawImage(image, x, y, imgWidth, imgHeight);
          canvas.toBlob(blob => resolve(blob), imgType);
        }
      };
    } else {
      reject();
    }
  });
}

export function downloadImage(params: any, fileName?: string, imgType?: string) {
  return new Promise((resolve, reject) => {
    if (params.url) {
      blobFromImage(params, imgType).then((blob: any) => {
        const filetype = params.url.split('.').pop();
        if (!fileName) fileName = params.url.split('/').pop().split('.')[0];
        const _folderName = getExportFileName(fileName);
        // 保存Blob为文件
        FileSaver.saveAs(blob, _folderName + '.' + filetype);
        resolve(true);
      });
    } else {
      reject();
    }
  });
}

export function blobFromImageUrl(url: string) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => resolve(blob))
      .catch(error => reject(error));
  });
}

export function fileFromImageUrl(url: string) {
  return new Promise((resolve, reject) => {
    blobFromImageUrl(url)
      .then((blob: any) => {
        const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
        resolve(file);
      })
      .catch(error => reject(error));
  });
}

export function bufferFromImageUrl(url: string, decode = false) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        if (!decode) resolve(buffer);
        else {
          const decoder = new TextDecoder('iso-8859-1');
          resolve(decoder.decode(buffer));
        }
      })
      .catch(error => reject(error));
  });
}

export function binaryFromImageUrl(url: string) {
  return new Promise((resolve, reject) => {
    bufferFromImageUrl(url)
      .then((buffer: any) => {
        const binaryData = new Uint8Array(buffer);
        resolve(binaryData);
      })
      .catch(error => reject(error));
  });
}

export function base64UriFromBlob(blob: Blob) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64data = reader.result;
      resolve(base64data);
    };
    reader.onerror = () => {
      resolve(undefined);
    };
  });
}

export function base64UriFromImageUrl(url: string) {
  return new Promise(resolve => {
    blobFromImageUrl(url)
      .then((blob: any) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      })
      .catch(() => resolve(undefined));
  });
}

export function blobFromImageSplicing(images: any) {
  return new Promise((resolve, reject) => {
    if (images && images.length) {
      Promise.all(
        images.map((ele: any) => {
          return new Promise(resolve => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.src = ele.url;
            img.onload = () => {
              resolve(img);
            };
          });
        })
      ).then(
        tags => {
          let maxWidth = 0;
          let totalHeight = 0;
          const imageInfos = tags.map(tag => {
            if (tag.naturalWidth > maxWidth) maxWidth = tag.naturalWidth;
            totalHeight += tag.naturalHeight;
            return {
              width: tag.naturalWidth,
              height: tag.naturalHeight,
              tag,
            };
          });
          const canvas = document.createElement('canvas');
          canvas.width = maxWidth;
          canvas.height = totalHeight;
          let offsetY = 0;
          const ctx = canvas.getContext('2d');
          imageInfos.forEach(img => {
            ctx?.drawImage(img.tag, 0, offsetY, img.width, img.height);
            offsetY += img.height;
          });
          canvas.toBlob(blob => {
            resolve(blob);
          });
        },
        () => reject()
      );
    } else {
      reject();
    }
  });
}

export function imageSplicingDownload(images: Array<any>, fileName = '拼接图', filetype = 'jpg') {
  return new Promise((resolve, reject) => {
    if (images && images.length) {
      blobFromImageSplicing(images).then(
        blob => {
          const _folderName = getExportFileName(fileName);
          // 使用FileSaver.js保存Blob为文件
          FileSaver.saveAs(blob as Blob, _folderName + '.' + filetype);
          resolve(true);
        },
        () => reject()
      );
    } else {
      reject();
    }
  });
}
