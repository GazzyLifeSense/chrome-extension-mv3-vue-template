import { OpUnitType } from 'dayjs';
import { getRemainingSeconds } from '@/utils/public.ts';

const baseKey = import.meta.env.VITE_STORAGE_BASE_KEY;

interface CacheObjType{ [key:string]: any }

class ChromeStorage {
    prefixKey: string;
    version: Nullable<string>;
    timeout: Nullable<number>; // 设缓存时的过期时间
    constructor() {
        this.prefixKey = baseKey || '';
        this.version = null;
        this.timeout = null;
    }
    private getKey(key: string) {
        const _key = this.prefixKey ? this.prefixKey + '_' + key : key;
        return _key.toUpperCase();
    }
    private getKeys(keys: string[]) {
        const result: any[] = [];
        if (keys && keys.length) {
        keys = Array.from(new Set(keys)); // 去重
        keys.forEach(key => {
            result.push({
            oldKey: key,
            newKey: this.getKey(key),
            });
        });
        }
        return result;
    }
    // 解构获取缓存值
    private deconstructValue(data: CacheObjType, key: string, defaultVal: any) {
        let result = null;
        if (data[key]) {
            const { version, expire, value } = data[key];
            const IsDeprecated =
                (!this.version || !version) || version !== this.version;
            // （是否过期检查）未过期情况：1.未设置过期时间  2. 过期时间晚于当前时间
            const IsExpire =
                !expire || expire < new Date().getTime();
            if (!IsExpire && !IsDeprecated) {
                result = JSON.parse(value);
            } else {
                this.remove(key);
            }
        }
        return result || defaultVal;
    }
    set(key: string, value: any): void {
        if (value) {
        const valueData = {
            createTime: Date.now(),
            version: !Number.isNaN(this.version) ? null : this.version,
            expire: !Number.isNaN(this.timeout) ? null : new Date().getTime() + (this.timeout as number) * 1000,
            value: JSON.stringify(value),
        };
        const data: CacheObjType = {};
        data[this.getKey(key)] = valueData;
        chrome.storage.local.set(data);
        }
    }
    get(key: string, defaultVal: any = null): any {
        return new Promise(resolve => {
        const _key = this.getKey(key);
        chrome.storage.local.get([_key], res => resolve(this.deconstructValue(res, _key, defaultVal)));
        });
    }
    gets(keys: string[], def: any = {}): any {
        return new Promise(resolve => {
        const _keysData = this.getKeys(keys);
        const _keys = _keysData.map(ele => ele.newKey);
        chrome.storage.local.get(_keys, res => {
            const data: any = {};
            let hasData = false;
            _keysData.forEach(ele => {
            const _key = ele.newKey;
            const key = ele.oldKey;
            const value = this.deconstructValue(res, _key, null);
            if (value) {
                data[key] = value;
                hasData = true;
            }
            });
            resolve(hasData ? data : def);
        });
        });
    }
    // 移除单条缓存
    remove(key: string): void {
        this.removes([key]);
    }
    // 移除多条缓存
    removes(keys: string[]): void {
        const _keysData = this.getKeys(keys);
        const _keys = _keysData.map(ele => ele.newKey);
        if (_keys && _keys.length) chrome.storage.local.remove(_keys);
    }
    // 清空缓存
    clear(): void {
        chrome.storage.local.clear();
    }
}

// 设置缓存
function saveCache(key: string, value: any, time = null, unit = 'minute' as OpUnitType) {
    const storage = new ChromeStorage();
    if(time) storage.timeout = getRemainingSeconds(time, unit); //默认 5 分钟
    storage.set(key, value);
}

// 获取缓存
function getCache(key: string) {
    return new Promise(resolve => {
        if (key) {
            const storage = new ChromeStorage();
            storage.get(key).then((value: any) => resolve(value ? value : null));
        } else {
            resolve(null);
        }
    });
}

export { ChromeStorage, saveCache, getCache }