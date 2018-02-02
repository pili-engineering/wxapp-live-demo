/*
 * app.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());
app.use('/wechat', require('./routers/wechat'));
app.use('/pili', require('./routers/pili'));

const server = http.createServer(app);

module.exports = server;
