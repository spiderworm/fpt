
var chunkUtil = {
  getID: function(chunk) {
    if(typeof chunk === "string") {
      return chunk;
    } else if(typeof chunk === "object") {
      var position = this.getPosition(chunk);
      return position.join('|');
    }
  },
  getChunk: function(chunker,chunk) {
    var id = this.getID(chunk);
    return chunker.chunks[id];
  },
  getPosition: function(chunk) {
    if(typeof chunk === "string") {
      return string.split('|');
    } else if(chunk instanceof Array) {
      return chunk;
    } else if(chunk.position) {
      return chunk.position;
    }
  }
};

module.exports = chunkUtil;