/*
 * index.js
 * Copyright (C) 2018 disoul <disoul@DiSouldeMacBook-Pro.local>
 *
 * Distributed under terms of the MIT license.
 */

Component({
  properties: {
    coverImage: String,
    active: Boolean,
    avatarImage: String,
    liveTitle: String,
    userName: String,
    index: Number,
  },
  methods: {
    onTap() {
      this.triggerEvent('enter', this.properties.index);
    },
    empty() {},
  }
});
