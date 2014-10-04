
var GameItem = require('./GameItem');

function ServerGameItem(entityID,physics,mesh) {
  GameItem.apply(this,[entityID,physics,mesh]);
  this.__addedItems = {};
}

GameItem.subclass(ServerGameItem);

ServerGameItem.prototype.addItem = function(gameItem) {
  GameItem.prototype.addItem.apply(this,[gameItem]);
  if(gameItem.serialize) {
    this.__addedItems[gameItem.id] = gameItem.serialize();
  }
}

ServerGameItem.prototype.getUpdate = function() {
  var items = {};
  this.eachItem(function(item) {
    if(item.getUpdate) {
      items[item.id] = item.getUpdate();
    }
  });
  var update = {
    position: this.position.export(),
    quaternion: this.quaternion.export(),
    items: items,
    addedItems: this.__flushAddedItems(),
    removedItems: this.__flushRemovedItems()
  };
  return update;
}

ServerGameItem.prototype.__flushAddedItems = function() {
  var items = this.__addedItems;
  this.__addedItems = {};
  return items;
}

ServerGameItem.prototype.__flushRemovedItems = function() {
  var items = this.__removedItems;
  this.__removedItems = {};
  return items;
}

module.exports = ServerGameItem;