/*
 * auth.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const jwt = require('jsonwebtoken');
const { User } = require('./models');

async function auth(req, res, next) {
  const token = req.get('Authorization');
  if (!token) {
    res.status(403).json({ error: 'no Authorization' });
    return;
  }

  const decoded = jwt.decode(token);
  const userId = decoded.id;
  try {
    const user = await User.findOne({ _id: userId });
    jwt.verify(token, user.sessionKey);
    req.user = user;
  } catch (e) {
    res.status(403).json({ error: 'can not verify user' });
    return;
  }


  next();
}

module.exports = auth;
