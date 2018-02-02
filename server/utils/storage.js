/*
 * storage.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MELT license.
 */
const { User, Group } = require('../models');

exports.getUsersFromGroup = async function(groupId) {
  try {
    const group = await Group.findOne({ groupId });
    const users = [];
    for (let i = 0; i < group.members.length; i+=1) {
      const user = await User.findOne({ userId: group.members[i] });
      delete user.sessionKey;
      users.push(user);
    }

    return users;
  } catch (e) {
    throw new Error('get Users From group error ' + e.toString());
  }
}
