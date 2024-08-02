import { base64UriFromImageUrl } from '@/utils/img.ts';
import { fetchController } from '../api';

console.log('service worker started!'); 

// 插件卸载事件
// chrome.runtime.setUninstallURL(`${'xxx'}/unload`);

// 消息通信短链接
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    const act = msg.act;
    if (sender.id === chrome.runtime.id && act) {
        switch (act) {
        case 'GET':
            fetchController(msg.url, msg.config)
            .then(sendResponse)
            .catch(sendResponse);
            break;
        case 'POST':
            fetchController(msg.url, msg.config)
            .then(sendResponse)
            .catch(sendResponse);
            break;
        // 获取文件Base64Url
        case 'FETCH_FILE':
            const url = msg.url;
            const type = msg.filetype;
            switch (type) {
            case 'img':
                base64UriFromImageUrl(url).then(sendResponse);
                break;
            }
            break;
    }
    return true; // 异步调用，必须
  }
});

// 侦听userInfo变化
chrome.storage.local.onChanged.addListener(changeValues => {
    for (const key in changeValues) {
        const changeValue = changeValues[key];
        // userInfo changed
        if (key === 'info') {
            let action = '';
            // 登录
            if (
                !changeValue.oldValue &&
                changeValue.newValue &&
                Object.keys(changeValue.newValue).length > 0
            ) {
                action = `${import.meta.env.VITE_CRX_CLASS_PREFIX}-userLogin`;
            } 
            // 更新或移除: 
            else {
                action = `${import.meta.env.VITE_CRX_CLASS_PREFIX}-updateUserInfo`;
            }
            if (action) {
                chrome.runtime.sendMessage({ action });
                chrome.tabs.query({ active: true }, tabs => {
                    tabs.forEach((tab: any) => {
                        // dispatch msg to every tab for refetching userInfo
                        chrome.tabs.sendMessage(tab.id, { action });
                    });
                });
            }
        } 
        // userToken changed
        else if (key == 'userToken') {
            if (changeValue?.newValue?.length) {
                // get latest user info
            }
        }
    }
});