/*
 * user.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const mongoose = require('mongoose');
const { Schema, ObjectId } = mongoose;

const UserSchema = new Schema({
  userId: { type: String, unique: true },
  nickName: String,
  avatarUrl: String,
  gender: Number,
  province: String,
  country: String,
  sessionKey: String,
  liveTitle: String,
});

const GroupSchema = new Schema({
  groupId: { type: String, unique: true },
  groupName: String,
  members: [String],
});

exports.User = mongoose.model('User', UserSchema);
exports.Group = mongoose.model('Group', GroupSchema);
