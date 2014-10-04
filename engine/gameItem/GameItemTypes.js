var Class = require('../lib/Class');


function GameItemTypes() {
  this.__types = {};
}

GameItemTypes.prototype.add = function(typeID,Type) {
  if(this.__types[typeID]) {
    throw new Error('I already have type ' + typeID);
  }
  this.__types[typeID] = Type;
  Type.__typeID = typeID;
}

GameItemTypes.prototype.getTypeID = function(Type) {
  return Type.__typeID;
}

GameItemTypes.prototype.getTypeByID = function(typeID) {
  return this.__types[typeID];
}

module.exports = GameItemTypes;
