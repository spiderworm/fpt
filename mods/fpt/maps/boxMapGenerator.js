var Map = require('../../../engine/map/Map');

var map = new Map();

var count = 0;

map.settings = {
  "initialPosition":[0,30,0],
  "chunkDistance":6,
  "removeDistance":10,
  "chunkSize":16,
  "generateChunks":true,
  "bounds":[[-50,-50,-50],[50,50,50]],
  "generate": function (x,y,z) {
    if(Math.abs(x) > 50 || Math.abs(y) > 50 || Math.abs(z) > 50) {
      return 0;
    }
    if( Math.abs(x) === 50 || Math.abs(y) === 50 || Math.abs(z) === 50 ) {
      return 3;
    }
    if(y < 10) {
      return 1;
    }
    return 0;
  }
};

module.exports = map;