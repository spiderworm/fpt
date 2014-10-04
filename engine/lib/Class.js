
var extend = require('extend');

function Class(TargetClass) {
  TargetClass.subclass = Class.subclass;
  TargetClass.mixin = Class.mixin;
}

Class.subclass = function() {
  var Superclass = getSuperClass(this,arguments),
      Subclass = getSubClass(arguments);
  subclass(Superclass,Subclass);
}

Class.mixin = function() {
  var Superclass = getSuperClass(this,arguments),
      Subclass = getSubClass(arguments);
  mixin(Superclass,Subclass);
}

function getSuperClass(CurrentClass,args) {
  if(args.length === 1) {
    return CurrentClass;
  } else if(args.length === 2) {
    return args[0];
  } else {
    throw new Error('incorrect number of arguments passed');
  }
}

function getSubClass(args) {
  if(args.length === 1) {
    return args[0];
  } else if(args.length === 2) {
    return args[1];
  } else {
    throw new Error('incorrect number of arguments passed');
  }
}

function subclass(Superclass,Subclass) {
  Subclass.prototype.__proto__ = Superclass.prototype;
  new Class(Subclass);
}

function mixin(Superclass,Subclass) {
  extend(Subclass.prototype,Superclass.prototype);
  new Class(Subclass);
}

module.exports = Class;
