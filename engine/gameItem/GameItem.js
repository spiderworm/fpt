
var EventEmitter = require('events').EventEmitter;
var Class = require('../lib/Class');
var GameItemTypes = require('./GameItemTypes');
var CANNON = require('../lib/sharedLibs').CANNON;
var THREE = require('../lib/sharedLibs').THREE;

function GameItem(id,physics,view) {
  EventEmitter.apply(this);

  if(!id) id = GameItem.createUniqueID(this);
  this._gameItemID = id;
  this.__items = {};
  this.avatar = this;

  this.__physicsWorld = null;
  this.__physicsBodies = [];
  this.__physicsConstraints = [];
  this.__viewScene = null;
  this.__viewItems = [];

  this.physics = physics;
  this.view = view;

  var viewPosition = view ? view.position : {};
  var viewQuaterion = view ? view.quaternion : {};
  var physicsPosition = physics ? physics.position : {};
  var physicsQuaternion = physics ? physics.quaternion : {};
  this.position = new Position(physicsPosition,viewPosition);
  this.quaternion = new Quaternion(physicsQuaternion,viewQuaterion);

}

Class.subclass(EventEmitter,GameItem);

Object.defineProperty(GameItem.prototype,'id',{
  get: function() {
    return this._gameItemID;
  },
  set: function() {}
});

Object.defineProperty(GameItem.prototype,'physics',{
  get: function() {
    return this._physics;
  },
  set: function(physics) {
    if(physics) {
      if(this._physics) {
        this.physics = null;
      }
      this._physics = physics;
      if(physics instanceof CANNON.World) {
        this.__setPhysicsWorld(physics);
      } else {
        this.__addPhysicsBody(physics);
      }
    } else {
      if(this._physics) {
        this.__removePhysicsItem(this._physics);
      }
      this._physics = null;
    }
  }
});

Object.defineProperty(GameItem.prototype,'view',{
  get: function() {
    return this._view;
  },
  set: function(view) {
    if(view) {
      if(this._view) {
        this.view = null;
      }
      this._view = view;
      if(view instanceof THREE.Scene) {
        this.__setViewScene(view);
      } else {
        this.__addViewItem(view);
      }
    } else {
      if(this._view) {
        this.__removeViewItem(this._view);
      }
      this._view = null;
    }
  }
});

Object.defineProperty(GameItem.prototype,'mesh',{
  get: function() {
    return this.view;
  },
  set: function(mesh) {
    this.view = mesh;
  }
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
  if(this.__items[gameItem.id]) {
    this.removeItem(this.__items[gameItem.id]);
    //throw new Error('I already have item ' + gameItem.id);
  }
  if(gameItem instanceof GameItem) {
    if(this.__viewScene) {
      gameItem.__setViewScene(this.__viewScene);
    }
    if(this.__physicsWorld) {
      gameItem.__setPhysicsWorld(this.__physicsWorld);
    }
  }
  this.__items[gameItem.id] = gameItem;
  this.emit('new-item',gameItem);
}

GameItem.prototype.removeItem = function(gameItem) {
  if(this.__items[gameItem.id] === gameItem) {
    if(gameItem instanceof GameItem) {
      gameItem.__unsetViewScene();
      gameItem.__unsetPhysicsWorld();
    }
    this.__items[gameItem.id] = null;
  }
}

GameItem.prototype.attachItem = function(thisPivot,gameItem,itemPivot) {
  this.addItem(gameItem);
  var bodyA = this.physics;
  var bodyB = gameItem.physics;

  var thisPivot = new CANNON.Vec3(thisPivot[0],thisPivot[1],thisPivot[2]);
  var localPivot = new CANNON.Vec3(itemPivot[0],itemPivot[1],itemPivot[2]);
  var constraint = new CANNON.PointToPointConstraint(
    bodyA,
    thisPivot,
    bodyB,
    localPivot,
    100
  );
  gameItem.__addPhysicsConstraint(constraint);
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
    if(physicsItem instanceof CANNON.PointToPointConstraint) {
      physicsWorld.addConstraint(physicsItem);
    } else if(physicsItem instanceof CANNON.Body) {
      physicsWorld.add(physicsItem);
    }
  }
}

function removeFromWorld(physicsWorld,physicsItem) {
  if(physicsWorld) {
    if(physicsItem instanceof CANNON.PointToPointConstraint) {
      physicsWorld.removeConstraint(physicsItem);
    } else if(physicsItem instanceof CANNON.Body) {
      physicsWorld.remove(physicsItem);
    }
  }
}

GameItem.prototype.__setPhysicsWorld = function(physicsWorld) {
  this.__physicsWorld = physicsWorld;
  for(var i=0; i<this.__physicsBodies.length; i++) {
    addToWorld(physicsWorld,this.__physicsBodies[i]);
  }
  this.eachItem(function(item) {
    if(item instanceof GameItem) {
      item.__setPhysicsWorld(physicsWorld);
    }
  });
  for(var i=0; i<this.__physicsConstraints.length; i++) {
    addToWorld(physicsWorld,this.__physicsConstraints[i]);
  }
}

GameItem.prototype.__unsetPhysicsWorld = function(physicsWorld) {
  var physicsWorld = this.__physicsWorld;
  this.__physicsWorld = null;
  for(var i=0; i<this.__physicsConstraints.length; i++) {
    removeFromWorld(physicsWorld,this.__physicsConstraints[i]);
  }
  this.eachItem(function(item) {
    if(item instanceof GameItem) {
      item.__unsetPhysicsWorld();
    }
  });
  for(var i=0; i<this.__physicsBodies.length; i++) {
    removeFromWorld(physicsWorld,this.__physicsBodies[i]);
  }
}

GameItem.prototype.__addPhysicsBody = function(body) {
  this.__physicsBodies.push(body);
  addToWorld(this.__physicsWorld,body);
}

GameItem.prototype.__addPhysicsConstraint = function(constraint) {
  this.__physicsConstraints.push(constraint);
  addToWorld(constraint);
}





/* view helper methods */

function addToScene(scene,viewItem) {
  if(scene) {
    viewItem.useQuaternion = true;
    scene.add(viewItem);
  }
}

function removeFromScene(scene,viewItem) {
  if(scene) {
    scene.remove(viewItem);
  }
}

GameItem.prototype.__setViewScene = function(scene) {
  this.__viewScene = scene;
  for(var i=0; i<this.__viewItems.length; i++) {
    addToScene(scene,this.__viewItems[i]);
  }
  this.eachItem(function(item) {
    if(item instanceof GameItem) {
      item.__setViewScene(scene);
    }
  });
}

GameItem.prototype.__unsetViewScene = function() {
  var scene = this.__viewScene;
  this.__viewScene = null;
  for(var i=0; i<this.__viewItems.length; i++) {
    removeFromScene(scene,this.__viewItems[i]);
  }
  this.eachItem(function(item) {
    if(item instanceof GameItem) {
      item.__unsetViewScene();
    }
  });
}

GameItem.prototype.__addViewItem = function(viewItem) {
  this.__viewItems.push(viewItem);
  addToScene(this.__viewScene,viewItem);
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