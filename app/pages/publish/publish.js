const app = getApp();
const host = app.globalData.host;

const pushModeMap = {
  '标清': 'SD',
  '高清': 'HD',
  '超清': 'FHD',
};

Page({
  data: {
    pushURL: null,
    pushMode: 'HD',
    pushModeText: '高清',
    canPush: false,
    active: true,
    magic: true,
    pushState: 'stop', // stop pushing pause pending
  },

  onLoad: function (option) {
    this.pushContext = wx.createLivePusherContext();
    this.getPushURL();
  },

  statechange(e) {
    switch (e.detail.code) {
      case -1307:
        wx.showToast({ title: '和远程服务器失去连接', icon: 'none' });
        break;
      case 3004:
        wx.showToast({ title: '远程服务器主动断开连接', icon: 'none' });
        break;
      default:
        break;
    }
  },

  // TODO: get push url
  getPushURL: function() {
  },

  onUnload() {
    app.sendWsMsg && app.sendWsMsg({type: 'live-status-change'});
    console.log('send', app.sendWsMsg);
    this.pushContext.stop();
  },
})
