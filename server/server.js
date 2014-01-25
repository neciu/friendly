function timeTick() {
    console.log('tick!');
}

setInterval(timeTick, 500);

Meteor.startup(function () {
    // code to run on server at startup
    const mapSize = 10;
    if (Tiles.find().fetch().length == 0) {
        for (var y = 0; y < mapSize; y++) {
            var row = {y: y, tiles: []};
            for (var x = 0; x < mapSize; x++) {
                Meteor._debug('inserting tile (' + x + ', ' + y + ')');
                var tileId = Tiles.insert({x: x, y: y, type: TILE_TYPE_EMPTY});
                row.tiles.push(tileId);
            }
            TileRows.insert(row);
        }
    }
});

Meteor.methods({
    logIn: function (playerId) {
        console.log('player logging with id: ' + playerId);
        var player = Players.findOne({_id: playerId});
        if (!player) {
            var newPlayerId = Players.insert({});
            player = Players.findOne({_id: newPlayerId});
        }

        var emptyTiles = Tiles.find({type: TILE_TYPE_EMPTY}).fetch();
        var selectedTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
        Tiles.update(selectedTile._id, {$set: {type: TILE_TYPE_PLAYER, playerId: player._id}});
        Players.update(player._id, {$set: {tileId: selectedTile._id}});

        userId = player._id;
        return player;

    },
    move: function (direction) {
        console.log('moving player: ' + userId, +', direction: ' + direction);
    }
});

Meteor.publish('players', function () {
    this._session.socket.on("close", function () {
        console.log('close ' + userId);
    });
});


