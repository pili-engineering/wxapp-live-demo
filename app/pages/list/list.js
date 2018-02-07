/*
 * list.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const app = getApp();
const host = app.globalData.host;

Page({
  data: {
    activeUser: [],
    fetched: false,
  },

  onLoginFinish() {
    this.groupId = app.globalData.groupId;
    wx.showShareMenu({
      withShareTicket: true
    });

    this.fetchActiveUser(() => {
      wx.hideLoading()
      this.setData({ fetched: true });
      this.autoToPlay();
    });

    // 轮询当前直播状态
    setInterval(this.fetchActiveUser, 2000);
  },

  onLoad() {
    wx.showLoading({ title: '登录中..'})
    if (!app.loginFinish) {
      app.loginFinish = this.onLoginFinish;
    } else {
      this.onLoginFinish();
    }
  },

  onPullDownRefresh() {
    if (this.refushing) return;
    this.refushing = true;
    wx.startPullDownRefresh();
    this.fetchActiveUser(() => {
      this.refushing = false;
      wx.stopPullDownRefresh();
    });
  },

  onShareAppMessage(options) {
    if (options.from === 'button') {
      const target = options.target;
      const user = this.data.activeUser[target.dataset.index];
      return {
        title: `七牛直播-${user.liveTitle}`,
        path: `/pages/list/list?user=${user.userId}&title=${user.liveTitle}`,
        imageUrl: user.avatarUrl,
      };
    } else {
      return {
        title: `七牛直播`,
        imageUrl: 'http://pili-playback.qnsdk.com/wxappcover.png',
        success: (res) => {
          const ticket = res.shareTickets[0];
          wx.getShareInfo({
            shareTicket: ticket,
            complete: ({err, encryptedData, iv}) => {
              app.setGroupData(iv, encryptedData, () => {
                this.groupId = app.globalData.groupId;
                this.fetchActiveUser();
              });
            },
          });
        },
      };
    }
  },

  toPlay(e, userid) {
    const user = this.data.activeUser[e.detail];
    wx.navigateTo({
      url: `../../pages/play/play?user=${userid || user.userId}`,
    });
  },

  autoToPlay() {
    // 如果query中带了目标用户，直接跳转到用户播放页面
    if (app.globalData.playUser) {
      const user = this.data.activeUser.filter(u => u.userId === app.globalData.playUser);
      if (user.length === 0) {
        wx.showToast({ title: '该主播已下播', icon: 'none' });
        return;
      };
      this.toPlay({}, app.globalData.playUser);
    }
  },

  onToPublish() {
    const title = `${app.globalData.userInfo.nickName}的直播间`;
    wx.navigateTo({
      url: `../../pages/publish/publish?title=${title}`,
    });
  },

  // 获取正在推流的用户，并同步到该页面的data中
  fetchActiveUser(cb) {
    app.fetchActiveUser().then((activeUser) => {
      const activeUserKey = activeUser.map(u => u.userId).reduce((a, b) => a + b, '');
      if (activeUserKey !== this.activeUserKey) {
        this.setData({ activeUser }, cb);
      } else {
        cb && cb();
      }

      this.activeUserKey = activeUserKey;
    });
  },
});
