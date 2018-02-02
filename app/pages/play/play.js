/*
 * play.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const app = getApp();
const host = app.globalData.host;

Page({
  data: {
    playURL: null,
  },

  // TODO: get user id
  onLoginFinish() {
    this.getPlayURL();
  },

  onLoad() {
    this.playContext = wx.createLivePlayerContext('player', this);
  },

  onShow() {
    if (app.loginFinish) {
      this.onLoginFinish();
    } else {
      app.loginFinish = this.onLoginFinish;
    }
  },

  statechange(e) {
    console.log(e.detail.code);
    switch (e.detail.code) {
      case 2004:
        this.setData({ startPlay: true });
        break;
      case 2103:
        wx.showToast({ title: '断开连接，正在重连', icon: 'none' });
        break;
      case -2301:
        wx.showToast({ title: '和远程服务断开连接', icon: 'none' });
        break;
    }
  },

  // TODO: get rtmp playurl
  getPlayURL: function(user) {
  }
});
