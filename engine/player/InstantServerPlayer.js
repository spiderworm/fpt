var ServerPlayer = require('./ServerPlayer');
var libs = require('../lib/sharedLibs');
var CANNON = libs.CANNON;
var ServerGameItem = require('../gameItem/ServerGameItem');

function InstantPlayer(connection,position) {

    var playerShape = new CANNON.Box(new CANNON.Vec3(.48,.96,.16));
    var physics = new CANNON.Body({mass: 100});
    physics.addShape(playerShape);
    physics.position.set(position[0], position[1], position[2]);

    ServerPlayer.apply(this,[
        connection.id,
        physics,
        null
    ]);

    var rightArm = new Arm();
    this.attachItem([.4,.48,0],rightArm,[-.16,.48,0]);

}

ServerPlayer.subclass(InstantPlayer);

InstantPlayer.prototype.tick = function(dt) {
    ServerPlayer.prototype.tick.apply(this,[dt]);

    var y = this.quaternion.y;
    var w = this.quaternion.w;
    this.quaternion.set(0,y,0,w);
    this.quaternion._physics.normalize();
    //this.quaternion.normalize();

}

InstantPlayer.serialize = function(instantPlayer) {
    return {};
}












function Arm() {
    var armShape = new CANNON.Box(
        new CANNON.Vec3(.16,.48,.16)
    );
    var physics = new CANNON.Body({mass: 1});
    physics.addShape(armShape);

    ServerGameItem.apply(
        this,
        [
            null,
            physics,
            null
        ]
    );
}

ServerGameItem.subclass(Arm);
ServerGameItem.types.add('PlayerArm',Arm);



module.exports = InstantPlayer;