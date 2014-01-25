setInterval(timeTick, 500);

function timeTick() {
//    Fiber(function () {
//        clearOfflinePlayers();
//    });
//    console.log('tick!');
}

lastPlayerCheckTimestamp = new Date().getTime();
const clearOffDuration = 2000;
const kickTreshold = 4000;
function clearOfflinePlayers() {
    var currentKeepAliveTimeStamp = new Date().getTime();
    if (currentKeepAliveTimeStamp - lastPlayerCheckTimestamp > clearOffDuration) {
        lastPlayerCheckTimestamp = currentKeepAliveTimeStamp;
        var playersToKick = [];
        Players.find().forEach(function (player) {
            if (currentKeepAliveTimeStamp - player.keepAliveTimeStamp > kickTreshold) {
                console.log('kicking player with id:' + player._id + ' (' + currentKeepAliveTimeStamp + ' - ' + player.keepAliveTimeStamp + ' = ' + currentKeepAliveTimeStamp - player.keepAliveTimeStamp);
                playersToKick.push(player);
            }
        });
        playersToKick.forEach(function (player) {
            var tile = Tiles.findOne({_id: player.tileId});
            Tiles.update(tile._id, {$set: {type: TILE_TYPE_EMPTY, playerId: null}});
            Players.remove(player._id);
        });
    }
}

lastMoveTimestamp = new Date().getTime();
const moveDuration = 200;
function movePlayers() {
    var currentTimeStamp = new Date().getTime();
    if (currentTimeStamp - lastMoveTimestamp > moveDuration) {
        lastMoveTimestamp = currentTimeStamp;
        Players.find().forEach(function (player) {
            if (player.direction) {
                movePlayer(player);
            }
        });
    }
}

function movePlayer(player) {
    var currentTile = Tiles.findOne({_id: player.tileId});
    var nextX;
    var nextY;
    switch (player.direction) {
        case MOVE_DIRECTION_UP:
            nextX = currentTile.x;
            nextY = currentTile.y - 1;
            break;
        case MOVE_DIRECTION_DOWN:
            nextX = currentTile.x;
            nextY = currentTile.y + 1;
            break;
        case MOVE_DIRECTION_LEFT:
            nextX = currentTile.x - 1;
            nextY = currentTile.y;
            break;
        case MOVE_DIRECTION_RIGHT:
            nextX = currentTile.x + 1;
            nextY = currentTile.y;
            break;
    }
    var nextTile = Tiles.findOne({x: nextX, y: nextY});
    if (nextTile && nextTile.type == TILE_TYPE_EMPTY) {
        Tiles.update(nextTile._id, {$set: {type: TILE_TYPE_PLAYER, playerId: player._id}});
        Tiles.update(currentTile._id, {$set: {type: TILE_TYPE_EMPTY, playerId: null}});
        Players.update(player._id, {$set: {direction: MOVE_DIRECTION_NONE, tileId: nextTile._id}});
    }
}

Meteor.startup(function () {
//    Fiber = Npm.require('fibers');

    // code to run on server at startup
    if (Tiles.find().fetch().length == 0) {
        const mapSize = 20;
        for (var y = 0; y < mapSize; y++) {
            var row = {y: y, tiles: []};
            for (var x = 0; x < mapSize; x++) {
                Meteor._debug('inserting tile (' + x + ', ' + y + ')');
                var tileId = Tiles.insert({x: x, y: y, type: TILE_TYPE_EMPTY});
                row.tiles.push(tileId);
            }
            TileRows.insert(row);
        }

        const numberOfTreasures = 10;
        for (var i = 0; i < numberOfTreasures; i++) {
            var emptyTiles = Tiles.find({type: TILE_TYPE_EMPTY}).fetch();
            var selectedTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            Tiles.update(selectedTile._id, {$set: {type: TILE_TYPE_TREASURE}});
        }
    }
});

Meteor.methods({
    keepAlive: function () {
        if (this.userId) {
            console.log('keep alive from: ' + this.userId);
            Players.update(this.userId, {$set: {keepAliveTimeStamp: new Date().getTime()}});
            clearOfflinePlayers();
            movePlayers();
        }
    },
    logIn: function (playerId) {
        console.log('player logging with id: ' + playerId);
        var player = Players.findOne({_id: playerId});
        if (!player) {
            var newPlayerId = Players.insert({});
            player = Players.findOne({_id: newPlayerId});
            var emptyTiles = Tiles.find({type: TILE_TYPE_EMPTY}).fetch();
            var selectedTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            Tiles.update(selectedTile._id, {$set: {type: TILE_TYPE_PLAYER, playerId: player._id}});
            Players.update(player._id, {$set: {tileId: selectedTile._id}});
        }

        this.setUserId(player._id);
        return player;
    },
    move: function (direction) {
        Players.update(this.userId, {$set: {direction: direction}});
    }
});


