/*
 * index.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const PLConfig = require('./config');
const { getRTMPPublishURL, getRTMPPlayURL } = require('./utils/request');
const { getLiveStream, disableStream } = require('./utils/api');

class PLService {
  constructor() {
    this.config = new PLConfig();
  }

  /**
   * 设置认证配置
   *
   * @param {string} ak AccessKey
   * @param {string} sk SecretKey
   */
  setAuthorization(ak, sk) {
    this.config.AK = ak;
    this.config.SK = sk;
  }

  /**
   * 设置VDN绑定的各个域名
   * 支持传入Object批量设定
   * 如：setDomain({rtmpPublich: 'xxx', hsl: 'xxx'})
   *
   * @param {'rtmpPublish'|'rtmpPlay'|'hdl'|'hsl'|'snapshot'|Object} type 域名类型
   * @param {string} url 域名值
   */
  setDomain(type, url) {
    if (typeof type === 'object') {
      const domainConfig = type;
      this.config.domain = {
        ...this.config.domain,
        ...domainConfig,
      };
      return;
    }

    this.config.domain[type] = url;
  }

  setSpace(space) {
    this.config.hub = space;
  }

  /**
   * 获取RTMP推流地址
   *
   * @param {string} streamKey
   * @param {int} expire Unix时间戳，过期时间
   * @returns {string} 推流地址
   */
  getRTMPPublishURL(streamKey, expire) {
    return getRTMPPublishURL(streamKey, expire, this.config);
  }

  /**
   * 获取RTMP播放地址
   *
   * @param {string} streamKey
   * @returns {string} 播放地址
   */
  getRTMPPlayURL(streamKey) {
    return getRTMPPlayURL(streamKey, this.config);
  }

  /**
   * 从给定的流中获取正在推流的流，并返回相关推流信息
   *
   * @param {[]string} streams StreamKey的数组
   * @returns {[]{key, startAt, clientIP, bps, fps}}
   */
  async getActiveStream(streams) {
    try {
      const res = await getLiveStream(streams, this.config);
      return res.items;
    } catch (e) {
      throw new Error('getLiveStream Error: ' + e.toString());
    }
  }

  /**
   * 禁播指定流
   *
   * @param {string} streamKey
   * @param {number} disabledTill Unix时间戳，表示流禁播的结束时间，-1表示永久禁播
   */
  async disableStream(streamKey, disabledTill) {
    try {
      await disableStream(streamKey, disabledTill, this.config);
    } catch(e) {
      throw new Error('disableStream Error: ' + e.toString());
    }
  }
}

module.exports = PLService;
