/*
 * index.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const app = require('./app');

const mongoose = require('mongoose');

mongoose.connect('mongodb://mongo:27017/piliwechat').catch(console.log);

app.listen(8686, () => { console.log('listening on 8686') });
