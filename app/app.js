//app.js
const host = '<Your Server Host>';

App({
  onLaunch: function (options) {
    this.globalData.host = host;

    this.login().then(() => {
      wx.getUserInfo({
        withCredentials: true,
        success: res => {
          this.globalData.userInfo = {
            ...this.globalData.userInfo,
            ...res.userInfo,
          };
        }
      });

      if (this.loginFinish) {
        this.loginFinish();
      } else {
        this.loginFinish = true;
      }

    });
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          this.globalData.wechatCode = res.code;
          resolve();
        },
        fail: reject,
      });
    });
  },

  globalData: {
    userInfo: {}
  }
})
