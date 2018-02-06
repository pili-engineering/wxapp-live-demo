/*
 * pili.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const PLService = require('./PLService');
const PILI = new PLService();

/**
 * 这里替换成七牛的 AK，SK
 */
PILI.setAuthorization(
  '<Your Qiniu AK>',
  '<Your Qiniu SK>',
);

/**
 * 这里替换成自己直播云中的推流地址和播放地址
 */
PILI.setDomain({
  rtmpPublish: 'pili-publish.qnsdk.com',
  rtmpPlay: 'pili-rtmp.qnsdk.com',
});

/**
 * 这里替换成自己直播云中的空间名称
 */
PILI.setSpace('sdk-live');

module.exports = PILI;
