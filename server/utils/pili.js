/*
 * utils.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */

const DELIMIT = '__';

/**
 * 通过用户id获取流id
 * TODO: 加入可逆向混淆
 *
 * @param {string} userId
 * @param {string} groupId
 * @returns {string} streamKey
 */
exports.getStreamKey = function(userId, groupId='') {
  // 这里只把用户id和流id做了映射，有需要可以把groupID也加到流id里
  // 实现只推一个group的功能
  return `stream${DELIMIT}${userId}`;
}

exports.getUserIdFromKey = function(streamKey) {
  const streamKeyArray = streamKey.split(DELIMIT);
  return streamKeyArray[1];
}
