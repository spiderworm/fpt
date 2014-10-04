
var Client = require('./Client');
var InstantPlayer = require('./player/InstantClientPlayer');
var events = require('./events');

function InstantClient() {
  
  Client.apply(this);

  var client = this;

  this.connection.on(events.STARTING_ITEMS,function(data) {
    console.info('starting items',data);
    var subItems = data.items;
    subItems.forEach(function(serializedItem) {
      var item = client.game.deserialize(serializedItem);
      client.game.addItem(item);
    });
  });

  this.game.registerItemType('Player',InstantPlayer);

  this.game.set('keybindings', {
    '<left>': 'left',
    '<right>': 'right',
    '<up>': 'forward',
    '<down>': 'backward',
    'W': 'forward',
    'A': 'left',
    'S': 'backward',
    'D': 'right',
    '<mouse 1>': 'fire',
    '<space>': 'jump'
  });

  var target;

  this.on('loadComplete',function() {
    document.body.appendChild(client.element);
    client.highlighter.on('highlight', function(voxel) {
      target = voxel;
    });
    client.highlighter.on('remove', function(voxel) {
      if(voxel[0] === target[0] && voxel[1] === target[1] && voxel[2] === target[2]) {
        target = null;
      }
    });
  });

  document.body.addEventListener("click",function() {
    if(target) {
      client.connection.emit("set",target,0);
    }
  });

}

Client.subclass(InstantClient);

module.exports = InstantClient;