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
            var tile = tiles[player.tileY][player.tileX];
            tile.type = TILE_TYPE_EMPTY;
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
    var currentTile = tiles[player.currentTile.y][player.currentTile.x];
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
    if (tiles[nextY][nextX] && tiles[nextY][nextX].type == TILE_TYPE_EMPTY) {
        tiles[nextY][nextX].type = TILE_TYPE_PLAYER;
        tiles[currentTile.y][currentTile.x].type = TILE_TYPE_EMPTY;
        Players.update(player._id, {$set: {direction: MOVE_DIRECTION_NONE, previousTile: tiles[currentTile.y][currentTile.x], currentTile: tiles[nextY][nextX] }});
    }
}

const mapSize = 40;
tiles = [];

Meteor.startup(function () {
    for (var y = 0; y < mapSize; y++) {
        var row = [];
        for (var x = 0; x < mapSize; x++) {
            row.push({x: x, y: y, type: TILE_TYPE_EMPTY});
        }
        tiles.push(row);

    }

    const numberOfTreasures = 10;
    for (var i = 0; i < numberOfTreasures; i++) {
        var tile = randomEmptyTile();
        tile.type = TILE_TYPE_TREASURE;
    }
});

function randomEmptyTile() {
    var x = Math.floor(Math.random() * mapSize);
    var y = Math.floor(Math.random() * mapSize);
    var tile = tiles[y][x];
    if (tile.type != TILE_TYPE_EMPTY) {
        return randomEmptyTile();
    } else {
        return tile;
    }
}

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

            var tile = randomEmptyTile();
            tile.type = TILE_TYPE_PLAYER;

            Players.update(player._id, {$set: {previousTile: tile, currentTile: tile} });
        }

        this.setUserId(player._id);
        return player;
    },
    getTiles: function () {
        console.log('get tiles with id: ' + this.userId);
        return tiles;
    },
    move: function (direction) {
        Players.update(this.userId, {$set: {direction: direction}});
    }
});


