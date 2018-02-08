/*
 * wechat.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const express = require('express');
const router = express.Router();

const auth = require('../auth');
const PILI = require('../pili.js');
const { getStreamKey } = require('../utils/pili');

router.use('/api', auth);
/**
 * 获取rtmp的推流或播放地址
 */
router.get('/api/rtmp/:type/:user?', (req, res) => {
  const type = req.params.type;
  const userId = req.params.user || req.user.userId;
  const streamKey = getStreamKey(userId);
  let rtmpURL;

  switch (type) {
    case 'play':
      rtmpURL = PILI.getRTMPPlayURL(streamKey);
      break;
    case 'publish':
      rtmpURL = PILI.getRTMPPublishURL(streamKey);
      break;
    default:
      res.status(403).json({ error: 'unsupport type' });
      return;
  }

  res.json({url: rtmpURL});
});

/**
 * 直播鉴黄的回调请求
 * TODO: 应该有token检查
 */
router.post('/r18', async (req, res) => {
  const body = req.body;
  console.log('R18警告', body);

  // 永久禁播R18主播
  await PILI.disableStream(body.stream, -1);

  res.status(204).send();
});

module.exports = router;
