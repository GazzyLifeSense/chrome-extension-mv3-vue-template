import { defineStore } from 'pinia';

interface UserInfo {
  user_name?: string; // 用户名
  mobile?: string; // 手机号
  role?: number; // 权限
}

export const userInfoStore = defineStore(`userInfoStore`, {
  persist: true,
  state: () => {
    return {
      userInfo: {} as UserInfo | undefined,
    };
  },
  getters: {
    isLogin(): Boolean {
      return !!Object.keys(this.userInfo || {}).length;
    }
  },
  actions: {
    // 保存用户信息到当前state
    saveUserInfo(info: UserInfo) {
      this.userInfo = info;
    },
    // 更新全局用户信息
    updateGlobalUserInfo(info: UserInfo) {
      chrome.storage.local.set({ info });
      this.userInfo = info;
    },
    // 清除用户信息
    clearUserInfo() {
      this.userInfo = undefined;
    },
    // 登出
    logout() {
      this.clearUserInfo();
      // 清空token及用户信息
      chrome.storage.local.remove(['userToken', 'info']);
    }
  },
});
