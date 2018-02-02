/*
 * index.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */
class PLWxConfig {
  constructor(config) {
    this.AK = null;
    this.SK = null;

    this.domain = {
      rtmpPublish: null,
      rtmpPlay: null,
      hdl: null,
      hsl: null,
      snapshot: null,
    };

    this.space = null;
  }
}

module.exports = PLWxConfig;
