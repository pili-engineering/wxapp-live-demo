// 需要https，详见微信相关文档
const host = '<Your Server Host>';

App({
  onLaunch: function (options) {
    this.globalData.host = host;
    this.globalData.query = options.query;

    this.login().then((id) => {
      this.globalData.userInfo = {};
      this.globalData.userInfo.id = id;
      wx.getUserInfo({
        withCredentials: true,
        success: res => {
          this.globalData.userInfo = {
            ...this.globalData.userInfo,
            ...res.userInfo,
          };
          wx.request({
            url: `${host}/wechat/user`,
            method: 'POST',
            dataType: 'json',
            data: { userInfo: res.userInfo, id },
          });
        }
      });

      /**
       * 如果用户是从微信群组打开的链接
       * 就通过ticket获取群组信息并同步给后端
       */ 
      if (options.shareTicket) {
        wx.getShareInfo({
          shareTicket: options.shareTicket,
          complete: ({err, encryptedData, iv}) => {
            this.setGroupData(iv, encryptedData, () => {
              if (this.loginFinish) {
                this.loginFinish();
              } else {
                this.loginFinish = true;
              }
            });
          },
        })
      } else {
        if (this.loginFinish) {
          this.loginFinish();
        } else {
          this.loginFinish = true;
        }
      }
    });
  },

  onShow(options) {
    this.globalData.query = options.query;
    this.globalData.playUser = this.globalData.query.user || null;
  },

  setGroupData(iv, encryptedData, cb) {
    console.log(iv, encryptedData);
    wx.request({
      url: `${host}/wechat/decrypt`,
      method: 'POST',
      data: {
        iv, encryptedData,
        userId: this.globalData.userInfo.id,
      },
      dataType: 'json',
      success: (res) => {
        this.globalData.groupId = res.data.openGId;
        wx.request({
          url: `${host}/wechat/group/add_member`,
          method: 'POST',
          data: {
            userId: this.globalData.userInfo.id,
            groupId: res.data.openGId,
          },
          success: cb,
        });
      },
    });
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: res => {
          this.globalData.wechatCode = res.code;
          wx.request({
            url: `${host}/wechat/login/${res.code}`,
            dataType: 'json',
            success: (res) => {
              resolve(res.data.userId);
            },
            fail: reject,
          });
        },
        fail: reject,
      });
    });
  },

  /**
  * 获取正在推流的用户
  */
  fetchActiveUser() {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${host}/wechat/activeuser`,
        success: (res) => {
          const activeUser = res.data.activeUser.map(u => {
            u.coverUrl = `http://pili-pic.qnsdk.com/sdk-live/${u.stream.key}.jpg`;
            return u;
          });

          this.globalData.activeUser = activeUser.sort((a, b) => {
            if (a.stream.startAt < b.stream.startAt) return 1;
            if (a.stream.startAt > b.stream.startAt) return -1;
            return 0;
          });

          this.globalData.activeUserMap = {};
          activeUser.forEach(user => {
            this.globalData.activeUserMap[user.userId] = user;
          });

          resolve(this.globalData.activeUser);
        },
        fail: reject,
      });
    });
  },

  globalData: {
    userInfo: {}
  }
})
