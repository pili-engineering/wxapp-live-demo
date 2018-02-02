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

const server = http.createServer(app);

module.exports = server;
