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
  const res = { items: [] };
  // vdn 查询接口一次最多100条
  // 这里需要优化，在大量用户的场景下应该由开发者自己维护推流状态表
  for (let i = 0; i < streamKeys.length; i += 100) {
    const keys = streamKeys.slice(i, i + 100);
    const data = await request(path, 'POST', {
      items: keys,
    }, config);
    res.items = res.items.concat(data.items);
  }

  return res;
}

exports.disableStream = async function(streamKey, disabledTill, config) {
  checkConfig(config, { hub: true, auth: true });
  const streamTitle = urlsafebase64Encode(streamKey);
  const path = `/v2/hubs/${config.hub}/streams/${streamTitle}/disabled`;
  return await request(path, 'POST', {
    disabledTill,
  }, config);
}
