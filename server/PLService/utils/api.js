/*
 * api.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
const { checkConfig } = require('./error.js');
const { request, urlsafebase64Encode } = require('./request');

exports.getLiveStream = async function(streamKeys, config) {
  checkConfig(config, { hub: true, auth: true });

  const path = `/v2/hubs/${config.hub}/livestreams`;
  return await request(path, 'POST', {
    items: streamKeys,
  }, config);
}

exports.disableStream = async function(streamKey, disabledTill, config) {
  checkConfig(config, { hub: true, auth: true });
  const streamTitle = urlsafebase64Encode(streamKey);
  const path = `/v2/hubs/${config.hub}/streams/${streamTitle}/disabled`;
  return await request(path, 'POST', {
    disabledTill,
  }, config);
}
