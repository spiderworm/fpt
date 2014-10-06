var Class = require('../lib/Class');


function InstantPlayerMixin(options) {
  options = options || {};
  var blockSize = .32;
  this._size = options.size || [blockSize*4,blockSize*8,blockSize];
  this._headSize = options.headSize || [blockSize*2,blockSize*2,blockSize];
}

Class.subclass(InstantPlayerMixin);

module.exports = InstantPlayerMixin;