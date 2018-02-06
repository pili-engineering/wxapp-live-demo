/*
 * wechat.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const express = require('express');
const router = express.Router();

const PILI = require('../pili');
const { User, Group } = require('../models');
const { getStreamKey } = require('../utils/pili');
const { getUserInfo, decryptData } = require('../utils/wechat');
const { getUsersFromGroup } = require('../utils/storage');

/**
 * 通过微信登录的code获取微信登录session
 */
router.get('/login/:code', async (req, res) => {
  const code = req.params.code;
  try {
    const userInfo = await getUserInfo(code);

    await User.findOneAndUpdate(
      { userId: userInfo.openid },
      { userId: userInfo.openid, sessionKey: userInfo.session_key },
      { upsert: true },
    );

    res.json({ userId: userInfo.openid });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.toString() });
  }

});

/**
 * 解密微信的加密数据
 */
router.post('/decrypt', async (req, res) => {
  const { iv, encryptedData, userId } = req.body;
  try {
    const user = await User.findOne({ userId });
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
router.post('/group/add_member', async (req, res) => {
  const { userId, groupId } = req.body;
  try {
    const group = await Group.findOneAndUpdate({ groupId }, { groupId }, { upsert: true }) || { groupId, members: [] };
    group.members.push(userId);
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
router.post('/user', async (req, res) => {
  try {
    const user = {
      ...req.body.userInfo,
      userId: req.body.id,
    };
    await User.findOneAndUpdate({ userId: req.body.id }, user, { upsert: true });
    res.json({ status: 'ok' });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e.toString() });
  }
});

/**
 * 获取当前正在推流的用户
 * 如果传入groupID，就只会搜索群组内部的用户
 * TODO: 该请求调用频繁，应该加入cache
 * (目前Demo没有做groupId的限制
 */
router.get('/activeuser/:groupId?', async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const users = groupId ? await getUsersFromGroup(groupId) : await User.find();
    const streams = users.map(user => getStreamKey(user.userId, groupId));
    const activeStream = await PILI.getActiveStream(streams);
    let activeStreamMap = {};
    activeStream.map(stream => activeStreamMap[stream.key] = stream);

    const activeUser = [];
    for (let i = 0; i < users.length; i += 1) {
      const user = users[i];
      const streamKey = getStreamKey(user.userId, groupId);
      if (Object.keys(activeStreamMap).indexOf(streamKey) !== -1) {
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
