
var GameItem = require('./GameItem');

function ClientGameItem(entityID,physics,mesh) {
  GameItem.apply(this,[entityID,physics,mesh]);
  this.__lastUpdate = null;
}

GameItem.subclass(ClientGameItem);

ClientGameItem.prototype.applyUpdate = function(update) {
  this.__lastUpdate = update;
  if(update.position) {
    this.position.import(update.position);
  }
  if(update.quaternion) {
    this.quaternion.import(update.quaternion);
  }
  if(update.items) {
    for(var id in update.items) {
      if(this.__items[id]) {
        this.__items[id].applyUpdate(update.items[id]);
      }
    }
  }
  if(update.addedItems) {
    for(var id in update.addedItems) {
      var serialized = update.addedItems[id];
      var item = this.deserialize(serialized);
      this.addItem(item);
    }
  }
}

module.exports = ClientGameItem;