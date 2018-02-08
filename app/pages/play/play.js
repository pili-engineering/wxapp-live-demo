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
    startPlay: false,
    playerActive: false,
    title: '',
  },
  onLoginFinish() {
    const user = app.globalData.activeUserMap[this.userId];
    if (!user) {
      wx.showToast({ title: '该主播已经下播', icon: 'none' });
      wx.navigateBack();
    }
    if (!this.playContext) {
      this.playContext = wx.createLivePlayerContext('player', this);
    }
    this.getPlayURL(this.userId);
  },

  onLoad(option) {
    this.userId = option.user;
    wx.showShareMenu({
      withShareTicket: true
    });
  },

  onShow() {
    this.setData({ startPlay: false });
    if (app.loginFinish) {
      this.onLoginFinish();
    } else {
      app.loginFinish = this.onLoginFinish;
    }
    wx.setKeepScreenOn({
      keepScreenOn: true
    });
  },

  onHide() {
    wx.setKeepScreenOn({
      keepScreenOn: false,
    });
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

  onPlayerTap() {
    if (!this.data.playerActive) {
      if (this.activeTimeout) {
        clearTimeout(this.activeTimeout);
      }
      this.activeTimeout = setTimeout(() => {
        this.setData({ playerActive: false });
        this.activeTimeout = null;
      }, 2000);
    }
    this.setData({ playerActive: !this.data.playerActive });
  },

  onPageExit() {
    wx.navigateBack();
  },

  getPlayURL: function(user) {
    const self = this;
    wx.request({
      url: `${host}/pili/api/rtmp/play/${this.userId}`,
      dataType: 'json',
      header: {
        Authorization: wx.getStorageSync('authToken'),
      },
      success: function(data) {
        self.setData({ playURL: data.data.url }, () => {
          self.playContext.play({
            success: function() {
              console.log('play success');
            },
            fail: function() {
              console.log('play fail');
            },
            complete: function() {
              console.log('complete');
            }
          });
          self.playContext.requestFullScreen({ direction: 0 });
        });
      },
    });
  }
});
