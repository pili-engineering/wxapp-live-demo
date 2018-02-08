//index.js
//获取应用实例

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
    active: true,
    magic: true,
    pushState: 'stop', // stop pushing pause pending
  },

  onLoad: function (option) {
    this.liveTitle = option.title;
    wx.showShareMenu({
      withShareTicket: true,
    });
    this.pushContext = wx.createLivePusherContext();
    this.getPushURL();
  },

  onShow() {
    wx.setKeepScreenOn({
      keepScreenOn: true,
    });
  },

  onHide() {
    wx.setKeepScreenOn({
      keepScreenOn: false,
    });
  },

  onShareAppMessage() {
    const user = app.globalData.userInfo;
    console.log(user);
    return {
      title: `七牛直播-${this.liveTitle}`,
      path: `/pages/list/list?user=${user.id}`,
      success: (res) => {
        if (!app.globalData.groupId) {
          const ticket = res.shareTickets[0];
          wx.getShareInfo({
            shareTicket: ticket,
            complete: ({err, encryptedData, iv}) => {
              app.setGroupData(iv, encryptedData);
            },
          });
        }
      }
    };
  },

  onViewTap() {
    this.setData({ active: !this.data.active });
  },

  onModeTap() {
    const list = ['标清', '高清', '超清'];
    wx.showActionSheet({
      itemList: list,
      success: (res) => {
        this.setData({ pushMode: pushModeMap[list[res.tapIndex]], pushModeText: list[res.tapIndex] });
      },
    })
  },

  onMagicTap() {
    this.setData({ magic: !this.data.magic });
  },

  onCloseTap() {
    wx.navigateBack();
  },

  onSwitchCamera() {
    this.pushContext.switchCamera();
  },

  startPush() {
    this.setData({ pushState: 'pending' });
    this.pushContext.start({
      success: () => {
        app.sendWsMsg && app.sendWsMsg({type: 'live-status-change'});
        console.log('send', app.sendWsMsg);
        this.setData({ pushState: 'pushing' });
      },
      fail: () => {
        wx.showToast({ title: '推流开始失败' });
        this.setData({ pushState: 'stop' });
      },
    });
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
    console.log('live-player code:', e.detail.code)
  },

  getPushURL: function() {
    wx.request({
      url: `${host}/pili/api/rtmp/publish`,
      dataType: 'json',
      header: {
        Authorization: wx.getStorageSync('authToken'),
      },
      success: (data) => {
        // 注意这里必须在setData的回调后才能开始推流
        this.setData({ pushURL: data.data.url }, () => {
          this.startPush();
        });
      },
      fail: () => {
        wx.showModal({
          title: '推流失败',
          content: '发生错误，无法获取推流地址',
          showCancel: false,
        });
      },
    });
  },

  onUnload() {
    this.pushContext.stop();
  },
})
