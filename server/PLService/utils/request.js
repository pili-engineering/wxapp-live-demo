/*
 * request.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const { URL } = require('url');
const crypto = require('crypto');
const axios = require('axios');

const { checkConfig } = require('./error');
const host = 'pili.qiniuapi.com';
/**
 * 获取HTTP请求的管理凭证
 *
 * @param {string} url 请求地址(包括host, query)
 * @param {object} headers
 * @param {object} config PLWxServer Config 对象
 * @returns {string} QiniuToken, 用于HTTP请求的Authorization字段
 */
exports.getQiniuToken = function(url, headers, config) {
  checkConfig(config, { auth: true });

  const urlObj = new URL(url);
  const host = urlObj.host;
  const path = urlObj.pathname;
  const query = urlObj.query;
  let data = `${headers.Method} ${path}`
  if (query) {
    data += `?${query}`;
  }
  data += `\nHost: ${host}`;

  if (headers['Content-Type']) {
    data += `\nContent-Type: ${headers['Content-Type']}\n\n`;
    if (headers['Content-Type'] !== 'application/octet-stream' && headers['Body']) {
      data += headers['Body'];
    }
  }

  const sign = base64ToUrlsafe(hmacSha1(data, config.SK));
  return `Qiniu ${config.AK}:${sign}`;
}

/**
 * 获取RTMP推流地址
 *
 * @param {string} streamKey
 * @param {int} expire Unix时间戳，过期时间
 * @param {Object} config PLWxConfig对象
 * @returns {string} rtmp publish url
 */
exports.getRTMPPublishURL = function(streamKey, expire, config) {
  checkConfig(config, { auth: true, domain: ['rtmpPublish'], hub: true });

  const domain = config.domain.rtmpPublish;
  const hub = config.hub;
  // 默认1小时过期
  const expireAt = expire || Math.round(Date.now() / 1000) + (1 * 60 * 60);

  const path = `/${hub}/${streamKey}?e=${expireAt}`;
  const sign = base64ToUrlsafe(hmacSha1(path, config.SK));
  const token = `${config.AK}:${sign}`;

  return `rtmp://${domain}${path}&token=${token}`;
}

exports.getRTMPPlayURL = function(streamKey, config) {
  checkConfig(config, { hub: true, domain: ['rtmpPlay'] });
  const hub = config.hub;
  const domain = config.domain.rtmpPlay;

  return `rtmp://${domain}/${hub}/${streamKey}`;
}

exports.request = async function(path, method, body, config) {
  const url = `http://${host}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    'Content-Length': JSON.stringify(body).length,
    'Body': JSON.stringify(body),
    'Method': method,
  };
  const qiniuToken = exports.getQiniuToken(url, headers, config);
  try {
    const res = await axios({
      url, method,
      headers: {
        'Authorization': qiniuToken,
        'Content-Type': 'application/json',
      },
      data: JSON.stringify(body),
      responseType: 'json',
    });
    return res.data;
  } catch (e) {
    throw new Error('requestError: ' + e.toString());
  }
}

function urlsafebase64Encode(data) {
  const base64 = new Buffer(data).toString('base64');
  return base64ToUrlsafe(base64);
}

function base64ToUrlsafe(base64) {
  return base64.replace(/\//g, '_').replace(/\+/g, '-');
}

function hmacSha1(encodedFlags, secretKey) {
  var hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(encodedFlags);
  return hmac.digest('base64');
}

exports.urlsafebase64Encode = urlsafebase64Encode;
exports.base64ToUrlsafe = base64ToUrlsafe;
exports.hmacSha1 = hmacSha1;
