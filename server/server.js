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
        tiles[nextY][nextX].playerId = player._id;
        tiles[currentTile.y][currentTile.x].type = TILE_TYPE_EMPTY;
        tiles[currentTile.y][currentTile.x].playerId = null;
        Players.update(player._id, {$set: {direction: MOVE_DIRECTION_NONE, previousTile: tiles[currentTile.y][currentTile.x], currentTile: tiles[nextY][nextX] }});
    }
}

const mapSize = 40;
tiles = [];
const timeToDigTreasure = 5000;

Meteor.startup(function () {
    for (var y = 0; y < mapSize; y++) {
        var row = [];
        for (var x = 0; x < mapSize; x++) {
            row.push({x: x, y: y, type: TILE_TYPE_EMPTY});
        }
        tiles.push(row);
    }

    var map = doMap(mapSize);
    for (var y = 0; y < mapSize; y++) {
        for (var x = 0; x < mapSize; x++) {
            if (map[y][x] != 0) {
                tiles[y][x].type = TILE_TYPE_OBSTACLE;
            }
        }
    }

    Treasures.find().forEach(function (treasure) {
        Treasures.remove(treasure._id);
    });
    const numberOfTreasures = 10;
    for (var i = 0; i < numberOfTreasures; i++) {
        var tile = randomEmptyTile();
        tile.type = TILE_TYPE_TREASURE;
        Treasures.insert({
                             tile: tile,
                             diggingPlayers: [],
                             lastTimeNotDigged: new Date().getTime()
                         });
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
                           digTreasure();
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

                           Players.update(player._id, {$set: {previousTile: tile, currentTile: tile, score: 0, hp: 3, fighting: false} });
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
                   },
                   toggleFighting: function () {
                       console.log('toggle1');
                       var player = Players.findOne(this.userId);
                       Players.update(this.userId, {$set: {fighting: !player.fighting}});
                   },
               });

function digTreasure() {
    var currentTimeStamp = new Date().getTime();
    Treasures.find().forEach(function (treasure) {
        updatePlayersNearTreasure(treasure);
        if (treasure.diggingPlayers.length != 2) {
            Treasures.update(treasure._id, {$set: {
                lastTimeNotDigged: currentTimeStamp
            } });
        } else {
            if (currentTimeStamp - treasure.lastTimeNotDigged > timeToDigTreasure) {
                var player = Players.findOne({_id: treasure.diggingPlayers[0]});
                Players.update(player._id, {$set: {score: player.score + 1}});

                player = Players.findOne({_id: treasure.diggingPlayers[1]});
                Players.update(player._id, {$set: {score: player.score + 1}});

                tiles[treasure.tile.y][treasure.tile.x].type = TILE_TYPE_EMPTY;
                Treasures.remove(treasure._id);
            }
        }
    });
}

function updatePlayersNearTreasure(treasure) {
    var diggingPlayers = [];
    if (treasure.tile.y - 1 > 0 && tiles[treasure.tile.y - 1][treasure.tile.x].type == TILE_TYPE_PLAYER) {
        diggingPlayers.push(tiles[treasure.tile.y - 1][treasure.tile.x].playerId);
    }
    if (treasure.tile.y + 1 < mapSize - 1 && tiles[treasure.tile.y + 1][treasure.tile.x].type == TILE_TYPE_PLAYER) {
        diggingPlayers.push(tiles[treasure.tile.y + 1][treasure.tile.x].playerId);
    }
    if (treasure.tile.x - 1 > 0 && tiles[treasure.tile.y][treasure.tile.x - 1].type == TILE_TYPE_PLAYER) {
        diggingPlayers.push(tiles[treasure.tile.y][treasure.tile.x - 1].playerId);
    }
    if (treasure.tile.x < mapSize - 1 && tiles[treasure.tile.y][treasure.tile.x + 1].type == TILE_TYPE_PLAYER) {
        diggingPlayers.push(tiles[treasure.tile.y][treasure.tile.x + 1].playerId);
    }
    Treasures.update(treasure._id, {$set: {
        diggingPlayers: diggingPlayers
    } });
}


