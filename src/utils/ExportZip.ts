import JSZip from 'jszip';
import FileSaver from 'file-saver';
import { blobFromImage } from '@/utils/img.ts';
import { message } from 'ant-design-vue';

export class ExportZip {
  public _options: any;
  public zipName: any;
  public onUpdate: any;
  public folders: any;
  public initProgress: any;
  public initLen: any;
  public fileProgress: any;
  public folderPromises: any;
  public zip: any;
  public throttleTimeout: any;

  constructor(options) {
    const { zipName, folders, onUpdate, initProgress, initLen } = options;
    if (!folders || Object.keys(folders).length <= 0) {
      throw Error('请提供原始数据');
    }

    this._options = options;
    this.zipName = zipName;
    this.onUpdate = onUpdate;
    this.folders = folders;
    this.initLen = initLen || 1; // 用于记录分批导出长度时的进度进算
    this.initProgress = initProgress || 0; // 初始进度，取值为0-100之间(从该进度开始计算)
    this.fileProgress = 0;
    this.throttleTimeout = null;
    this.folderPromises = null;
    this.zip = new JSZip();
  }

  // 开始执行的函数
  startRun(bufferFailed?) {
    return new Promise<void>((resolve, reject) => {
      const folderNotEmpty = this.folders.filter(
        fold => !fold.folders || (fold.folders && fold.folders.length)
      );
      this.folderPromises = this.addFolder(this.zip, folderNotEmpty);
      this.handleFolder()
        .then(
          () =>
            this.exportZip(bufferFailed)
              .then(() => resolve())
              .catch(error => {
                console.log('exportZip -->', error);
                throw error;
              }),
          () => reject()
        )
        .catch(error => {
          console.log('startRun -->', error);
          throw error;
        });
    });
  }

  /**
   * @description 匹配是否为图片
   * @param {String} _val
   */
  GRegexp(_val) {
    const _regexp = /^https?.*(jpg|jpeg|png|gif)$/gi;
    if (_regexp.test(_val)) {
      return true;
    }
    return false;
  }

  /**
   * @description 匹配是否为视频
   * @param {String} _val
   */
  GRegexpVideo(_val) {
    const _regexp = /^https?.*(mp4|rmvb|flv|mpeg|avi|mov)$/gi;
    if (_regexp.test(_val)) {
      return true;
    }
    return false;
  }

  // 获取远程文件
  getUrlFile(url) {
    return new Promise((resolve, reject) => {
      fetch(url, {
        method: 'get',
      })
        .then(data => data.arrayBuffer())
        .then(data => resolve(data))
        .catch(error => reject(error.toString()));
    });
  }

  addFolder(zipObj, folders) {
    // eslint-disable-next-line @typescript-eslint/no-array-constructor
    let result = Array();
    if (folders && folders.length > 0) {
      folders.forEach(folder => {
        if (folder) {
          const folderObj = folder.folderName ? zipObj.folder(folder.folderName) : zipObj;
          // 添加图片
          if (folder.images) {
            const fileRet = this.addFile(folderObj, {
              type: 'image',
              data: folder.images,
            });
            result = result.concat(fileRet);
          }
          // 添加视频
          if (folder.videos) {
            const fileRet = this.addFile(folderObj, {
              type: 'video',
              data: folder.videos,
            });
            result = result.concat(fileRet);
          }
          // 添加txt
          if (folder.txts) {
            const fileRet = this.addFile(folderObj, {
              type: 'txt',
              data: folder.txts,
            });
            result = result.concat(fileRet);
          }
          // 添加子文件夹
          if (folder.folders) {
            const folderRet = this.addFolder(folderObj, folder.folders);
            result = result.concat(folderRet);
          }
        }
      });
    }
    return result;
  }
  // 处理远程文件
  handleUrlFile(folderObj, data, name) {
    return new Promise<void>((resolve, reject) => {
      const filetype = data.filetype || data.url.split('.').pop();
      if (data.blob) {
        // 获取文件名
        const file_name = `${name}.${filetype}`;
        folderObj.file(file_name, data.blob, { binary: true }); // 逐个添加文件
        resolve();
      } else if (data.canvas) {
        blobFromImage(data).then(
          blob => {
            // 获取文件名
            const file_name = `${name}.${filetype}`;
            folderObj.file(file_name, blob, { binary: true }); // 逐个添加文件
            resolve();
          },
          () => reject()
        );
      } else {
        this.getUrlFile(data.url).then(
          (data: any) => {
            let isOk = false;
            if (data) {
              // 下载文件, 并存成ArrayBuffer对象
              // 通过返回请求头获取文件类型，用作文件后缀
              const contentType = data.headers['content-type'];
              if (contentType) {
                const _contentType = contentType.split('/');
                let _filetype = _contentType[_contentType.length - 1] || filetype;
                if (_filetype === 'quicktime') {
                  _filetype = 'mov';
                }
                // 获取文件名
                const file_name = `${name}.${_filetype}`;
                folderObj.file(file_name, data.data, { binary: true }); // 逐个添加文件
                isOk = true;
              }
            }
            isOk ? resolve() : reject();
          },
          () => reject()
        );
      }
    });
  }
  // 处理txt文件
  handleTxt(folderObj, content, name) {
    return new Promise<void>((resolve, reject) => {
      if (content) {
        // 获取文件名
        const file_name = `${name}.txt`;
        folderObj.file(file_name, content); // 逐个添加文件
        resolve();
      } else {
        reject();
      }
    });
  }

  handleFileProgress() {
    let currentProgress = 0;
    this.fileProgress += 100;
    if (this.folderPromises && this.folderPromises.length > 0) {
      const totalCount = this.folderPromises.length * 100 * 2;
      currentProgress = (this.fileProgress / totalCount) * 100;
    }
    if (this.onUpdate)
      this.onUpdate({
        currentFile: null,
        percent: this.formatCurrentProgress(currentProgress),
        initLen: this.initLen,
      });
  }

  // 添加文件
  addFile(folderObj, { type, data }) {
    // eslint-disable-next-line @typescript-eslint/no-array-constructor
    const result = Array();
    if (data && data.length > 0) {
      switch (type) {
        case 'image':
          // 如果文件夹下有图片对象，则遍历下载
          data.forEach((image, index) => {
            const imgUrl = image.url;
            const imgUrlCheck = imgUrl && this.GRegexp(imgUrl);
            if (imgUrlCheck || (image.blob && image.filetype)) {
              const name = image.name || index + 1;
              const promise = this.handleUrlFile(folderObj, image, name).then(
                () => this.handleFileProgress(),
                () => this.handleFileProgress()
              );
              result.push(promise);
            }
          });
          break;
        case 'video':
          // 如果文件夹下有video对象，则遍历下载
          data.forEach((video, index) => {
            const videoUrl = video.url;
            if (videoUrl && this.GRegexpVideo(videoUrl)) {
              const name = video.name || index + 1;
              const promise = this.handleUrlFile(folderObj, video, name).then(
                () => this.handleFileProgress(),
                () => this.handleFileProgress()
              );
              result.push(promise);
            }
          });
          break;
        case 'txt':
          // 如果文件夹下有txt对象，则遍历下载
          data.forEach((txtItem, index) => {
            const name = txtItem.name || index + 1;
            let content = '';
            txtItem.contents.forEach(ele => (content += ele + '\r\n'));
            const promise = this.handleTxt(folderObj, content, name).then(
              () => this.handleFileProgress(),
              () => this.handleFileProgress()
            );
            result.push(promise);
          });
          break;
      }
    }
    return result;
  }

  handleFolder() {
    return new Promise<void>((resolve, reject) => {
      if (this.folderPromises && this.folderPromises.length > 0) {
        Promise.allSettled(this.folderPromises).then(
          () => resolve(),
          () => resolve()
        );
      } else {
        reject();
      }
    });
  }

  // 导出压缩文件
  exportZip(bufferFailed?) {
    return new Promise<void>(resolve => {
      this.zip
        .generateAsync({ type: 'blob' }, data => {
          const len = this.folderPromises.length;
          const totalCount = len * 100 * 2;
          const currentProgress = ((data.percent * len) / totalCount) * 100 + 50;
          if (this.onUpdate)
            this.onUpdate({
              currentFile: data.currentFile,
              percent: this.formatCurrentProgress(currentProgress),
              initLen: this.initLen,
            });
        })
        .then(content => {
          if (!content.size) {
            message.info('所下载的数据为空');
          }
          // 生成二进制流
          FileSaver.saveAs(content, this.zipName || '未命名' + '.zip'); // 利用file-saver保存文件
          resolve();
        })
        .catch(error => {
          if (error instanceof RangeError) {
            // 内存溢出
            bufferFailed && bufferFailed();
            resolve();
          }

          throw error;
        });
    });
  }

  // 获取进度值
  formatCurrentProgress(cProgress) {
    if (this.throttleTimeout) {
      // 如果已经设置了节流定时器，则不执行
      return;
    }
    if (this.initProgress) {
      cProgress = cProgress * (1 - this.initProgress / 100) + this.initProgress;
    }

    // 设置节流定时器
    this.throttleTimeout = setTimeout(() => {
      this.throttleTimeout = null;
    }, 100);

    return cProgress;
  }
}
