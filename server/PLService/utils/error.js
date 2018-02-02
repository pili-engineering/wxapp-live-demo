/*
 * error.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
exports.checkConfig = function(config, fields) {
  if (fields.auth) {
    if (!config.AK || !config.SK) {
      throw new Error('请提供Qiniu认证Config, 缺少AccessKey和SecretKey');
    }
  }

  if (fields.domain) {
    const domainKeys = fields.domain;
    for (let index in domainKeys) {
      const key = domainKeys[index];
      if (!config.domain[key]) {
        throw new Error(`缺少Domain: ${key}, 请设置setDomain`);
      }
    }
  }
}
