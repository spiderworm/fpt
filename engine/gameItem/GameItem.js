
var EventEmitter = require('events').EventEmitter;
var Class = require('../lib/Class');
var GameItemTypes = require('./GameItemTypes');
var CANNON = require('../lib/sharedLibs').CANNON;

function GameItem(id,physics,view) {
  EventEmitter.apply(this);

  if(!id) id = GameItem.createUniqueID(this);
  this._gameItemID = id;
  this.__items = {};
  this.avatar = this;

  this.__physicsItems = [];
  this.physics = physics;
  if(physics) {
    if(physics instanceof CANNON.World) {
      this.__setPhysicsWorld(physics);
    } else {
      this.__addPhysicsItem(physics);
    }
  }

  this.view = view;
  this.mesh = view;
  var viewPosition = view ? view.position : {};
  var viewQuaterion = view ? view.quaternion : {};
  var physicsPosition = physics ? physics.position : {};
  var physicsQuaternion = physics ? physics.quaternion : {};
  this.position = new Position(physicsPosition,viewPosition);
  this.quaternion = new Quaternion(physicsQuaternion,viewQuaterion);

  if(physics) {
    physics.gameItem = this;
  }
}

Class.subclass(EventEmitter,GameItem);

Object.defineProperty(GameItem.prototype,'id',{
  get: function() {
    return this._gameItemID;
  },
  set: function() {}
});

GameItem.prototype.tick = function(ms) {
  if(this.physics && this.physics.tick) {
    this.physics.tick(ms);
  }

  if(this.view) {
    if(this.view.tick) {
      this.view.tick(ms);
    }
    if(this.physics) {
      this.view.position.set(
        this.physics.position.x,
        this.physics.position.y,
        this.physics.position.z
      );
      this.view.quaternion.set(
        this.physics.quaternion.x,
        this.physics.quaternion.y,
        this.physics.quaternion.z,
        this.physics.quaternion.w
      );
    }
  }

  this.eachItem(function(item) {
    if(item.tick) {
      item.tick(ms);
    }
  });

}

GameItem.prototype.getItemByID = function(id) {
  return this.__items[id];
}

GameItem.prototype.eachItem = function(callback) {
  for(var id in this.__items) {
    callback(this.__items[id]);
  }
}

GameItem.prototype.addItem = function(gameItem) {
  if(gameItem instanceof GameItem) {
    if(gameItem.view && this.view) {
      this.view.add(gameItem.view);
    }
    if(this.__physicsWorld) {
      gameItem.__setPhysicsWorld(this.__physicsWorld);
    }
  }
  this.__items[gameItem.id] = gameItem;
  this.emit('new-item',gameItem);
}

GameItem.prototype.attachItem = function(gameItem,thisPivot,itemPivot) {
  this.addItem(gameItem);
  var bodyA = this.physics;
  var bodyB = gameItem.physics;

  var thisPivot = new CANNON.Vec3(thisPivot[0],thisPivot[1],thisPivot[2]);
  var localPivotB = new CANNON.Vec3(itemPivot[0],itemPivot[1],itemPivot[2]);
  var constraint = new CANNON.PointToPointConstraint(
    bodyA,
    thisPivot,
    bodyB,
    localPivotB
  );
  gameItem.__addPhysicsItem(constraint);
}

GameItem.prototype.subscribeToItems = function(Type,callback) {

  function handler(items) {
    items.forEach(function(item) {
      callback(item);
    });
  }

  var items = this.getItemsOfType(Type);
  handler(items);
  
  this.on('new-item',function(item) {
    if(item instanceof Type) {
      handler([item]);
    }
  });
}

GameItem.prototype.getItemsOfType = function(Type) {
  var results = [];
  this.eachItem(function(item) {
    if(item instanceof Type) {
      results.push(item);
    }
  });
  return results;
}

GameItem.prototype.registerItemType = function(typeID,Type) {
  GameItem.types.add(typeID,Type);
}

GameItem.prototype.getType = function() {
  return this.constructor;
}

GameItem.prototype.getTypeID = function() {
  return GameItem.types.getTypeID(this.getType());
}

GameItem.prototype.serialize = function() {
  var result = {
    id: this.id,
    typeID: this.getTypeID(),
    items: [],
    fromType: this.getType().serialize ? this.getType().serialize(this) : {}
  };
  for(var id in this.__items) {
    if(this.__items[id] instanceof GameItem) {
      result.items.push(this.__items[id].serialize());
    }
  }
  return result;
}

GameItem.prototype.deserialize = function(serialized) {
  var Type = GameItem.types.getTypeByID(serialized.typeID);
  if(!Type) {
    throw new Error('cannot find type ' + serialized.typeID);
  }
  if(!Type.deserialize) {
    throw new Error('type ' + serialized.typeID + ' has no deserialize method');
  }
  var item = Type.deserialize(serialized.fromType);
  item._gameItemID = serialized.id;
  serialized.items.forEach(function(subserialized) {
    var subitem = item.deserialize(subserialized);
    item.addItem(subitem);
  });
  return item;
}

GameItem.prototype.__findTypeIDByType = function(Type) {
  return GameItem.getTypeID(Type);
}

GameItem.prototype.__findTypeByID = function(typeID) {
  return GameItem.getTypeByID(typeID);
}



/* physics helper methods */

function addToWorld(physicsWorld,physicsItem) {
  if(physicsWorld) {
    if(physicsItem instanceof CANNON.Constraint) {
      physicsWorld.addConstraint(physicsItem);
    } else if(
      physicsItem instanceof CANNON.Body ||
      physicsItem instanceof CANNON.RigidBody
    ) {
      physicsWorld.add(physicsItem);
    }
  }
}

GameItem.prototype.__setPhysicsWorld = function(physicsWorld) {
  this.__physicsWorld = physicsWorld;
  for(var i=0; i<this.__physicsItems.length; i++) {
    addToWorld(physicsWorld,this.__physicsItems[i]);
  }
  this.eachItem(function(item) {
    if(item instanceof GameItem) {
      item.__setPhysicsWorld(physicsWorld);
    }
  });
}

GameItem.prototype.__addPhysicsItem = function(physicsItem) {
  this.__physicsItems.push(physicsItem);
  addToWorld(this.__physicsWorld,physicsItem);
}






GameItem.createUniqueID = function(gameItem) {
  var id = "";
  if(gameItem) {
    id += gameItem.constructor.name;
  }
  GameItem.__lastID++;
  id += GameItem.__lastID;
  return id;
}
GameItem.__lastID = 0;





GameItem.types = new GameItemTypes();





GameItem.subclass = function(Constructor) {
  Class.subclass.apply(this,arguments);
  Constructor.types = GameItem.types;
  Constructor.subclass = this.subclass;
}



function Position(physicsPosition,meshPosition) {
  if(!physicsPosition) {
    console.trace("Here I am!");
  }
  this._physics = physicsPosition;
  this._mesh = meshPosition;
}

Position.prototype.export = function() {
  return [this.x,this.y,this.z];
}

Position.prototype.import = function(anExport) {
  this.set(anExport[0],anExport[1],anExport[2]);
}

Position.prototype.set = function(x,y,z) {
  this.x = x;
  this.y = y;
  this.z = z;
}

Object.defineProperty(Position.prototype,"0",{
  get: function() {
    return this.x;
  },
  set: function(x) {
    this.x = x;
  }
});

Object.defineProperty(Position.prototype,"1",{
  get: function() {
    return this.y;
  },
  set: function(y) {
    this.y = y;
  }
});

Object.defineProperty(Position.prototype,"2",{
  get: function() {
    return this.z;
  },
  set: function(z) {
    this.z = z;
  }
});

Object.defineProperty(Position.prototype,"x",{
  get: function() {
    return this._physics.x;
  },
  set: function(x) {
    this._physics.x = this._mesh.x = x;
  }
});

Object.defineProperty(Position.prototype,"y",{
  get: function() {
    return this._physics.y;
  },
  set: function(y) {
    this._physics.y = this._mesh.y = y;
  }
});

Object.defineProperty(Position.prototype,"z",{
  get: function() {
    return this._physics.z;
  },
  set: function(z) {
    this._physics.z = this._mesh.z = z;
  }
});









function Quaternion(physicsQuaternion,meshQuaterion) {
  this._physics = physicsQuaternion;
  this._mesh = meshQuaterion;
}

Quaternion.prototype.export = function() {
  return [this.x,this.y,this.z,this.w];
}

Quaternion.prototype.import = function(anExport) {
  this.set(anExport[0],anExport[1],anExport[2],anExport[3]);
}

Quaternion.prototype.set = function(x,y,z,w) {
  this.x = x;
  this.y = y;
  this.z = z;
  this.w = w;
}

Quaternion.prototype.normalize = function() {
  this._physics.normalize();
  this._mesh.normalize();
}

Object.defineProperty(Quaternion.prototype,"0",{
  get: function() {
    return this.x;
  },
  set: function(x) {
    this.x = x;
  }
});

Object.defineProperty(Quaternion.prototype,"1",{
  get: function() {
    return this.y;
  },
  set: function(y) {
    this.y = y;
  }
});

Object.defineProperty(Quaternion.prototype,"2",{
  get: function() {
    return this.z;
  },
  set: function(z) {
    this.z = z;
  }
});

Object.defineProperty(Quaternion.prototype,"3",{
  get: function() {
    return this.w;
  },
  set: function(w) {
    this.w = w;
  }
});

Object.defineProperty(Quaternion.prototype,"x",{
  get: function() {
    return this._physics.x;
  },
  set: function(x) {
    this._physics.x = this._mesh.x = x;
  }
});

Object.defineProperty(Quaternion.prototype,"y",{
  get: function() {
    return this._physics.y;
  },
  set: function(y) {
    this._physics.y = this._mesh.y = y;
  }
});

Object.defineProperty(Quaternion.prototype,"z",{
  get: function() {
    return this._physics.z;
  },
  set: function(z) {
    this._physics.z = this._mesh.z = z;
  }
});

Object.defineProperty(Quaternion.prototype,"w",{
  get: function() {
    return this._physics.w;
  },
  set: function(w) {
    this._physics.w = this._mesh.w = w;
  }
});





module.exports = GameItem;