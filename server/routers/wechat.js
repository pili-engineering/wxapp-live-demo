/*
 * wechat.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const auth = require('../auth');
const router = express.Router();

const PILI = require('../pili');
const { User, Group } = require('../models');
const { getStreamKey } = require('../utils/pili');
const { getUserInfo, decryptData } = require('../utils/wechat');
const { getUsersFromGroup } = require('../utils/storage');

router.use('/api', auth);
/**
 * 通过微信登录的code获取微信登录session
 */
router.get('/login/:code', async (req, res) => {
  const code = req.params.code;
  const token = req.get('Authorization');
  // 如果用户携带了认证token，就表示session没有过期，直接查表
  if (token) {
    const decoded = jwt.decode(token);
    const user = await User.findOne({ _id: decoded.id });
    try {
      jwt.verify(token, user.sessionKey);
      res.json({ token });
    } catch (e) {
      res.status(403).json();
    }

    return;
  }

  try {
    const userInfo = await getUserInfo(code);

    await User.findOneAndUpdate(
      { userId: userInfo.openid },
      { userId: userInfo.openid, sessionKey: userInfo.session_key },
      { upsert: true },
    );
    const user = await User.findOne({ userId: userInfo.openid });
    console.log(user);
    // 签发JWTtoken，用于之后认证
    const token = jwt.sign({ id: user._id }, user.sessionKey);
    res.json({ token });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.toString() });
  }

});

/**
 * 解密微信的加密数据
 */
router.post('/api/decrypt', async (req, res) => {
  const { iv, encryptedData } = req.body;
  try {
    const user = req.user;
    const data = decryptData(iv, user.sessionKey, encryptedData);
    res.send(data);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.toString() });
  }
});

/**
 * 将用户加入内部群组
 * 如果用户通过微信群打开，就把用户加入这个内部存储的群组
 * 方便实现基于群组的逻辑
 */
router.post('/api/group/add_member', async (req, res) => {
  const { groupId } = req.body;
  try {
    const group = await Group.findOneAndUpdate({ groupId }, { groupId }, { upsert: true }) || { groupId, members: [] };
    group.members.push(req.user.userId);
    group.members = Array.from(new Set(group.members));

    await Group.findOneAndUpdate({ groupId }, group, { upsert: true });
    res.json({ status: 'ok' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.toString() });
  }
});

/**
 * 将微信用户加入内部用户
 */
router.post('/api/user', async (req, res) => {
  try {
    const user = {
      ...req.body.userInfo,
      userId: req.user.userId,
    };
    await User.findOneAndUpdate({ userId: req.user.userId }, user, { upsert: true });
    res.json({ status: 'ok' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.toString() });
  }
});

/**
 * 获取当前正在推流的用户
 * 如果传入groupID，就只会搜索群组内部的用户
 * (目前Demo没有做groupId的限制
 */
let fetchLock = false;
let cacheUser = [];
let cacheStream = [];
let lastCache = 0;
router.get('/api/activeuser/:groupId?', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    let users;
    let activeStream;
    // 一个简单的缓存和缓存锁，永远每隔3s更新一次数据，防止重复请求
    if (!fetchLock && Date.now() - lastCache > 3000) {
      fetchLock = true;
      try {
        users = groupId ? await getUsersFromGroup(groupId) : await User.find();
        const streams = users.map(user => getStreamKey(user.userId, groupId));
        activeStream = await PILI.getActiveStream(streams);
        cacheUser = users;
        cacheStream = activeStream;
        lastCache = Date.now();
        fetchLock = false;
      } catch (e) {
        fetchLock = false;
        res.status(500).json({ error: e.toString() });
        return;
      }
    } else {
      users = cacheUser;
      activeStream = cacheStream;
    }
    let activeStreamMap = {};
    activeStream.map(stream => activeStreamMap[stream.key] = stream);

    const activeUser = [];
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];
      const streamKey = getStreamKey(user.userId, groupId);
      if (Object.keys(activeStreamMap).indexOf(streamKey) !== -1) {
        delete user._doc.sessionKey;
        activeUser.push({
          ...user._doc,
          stream: activeStreamMap[streamKey],
        });
      }
    }
    res.json({ activeUser });
  } catch (e) {
    res.status(500).json({ error: e.toString() });
  }
})

module.exports = router;
