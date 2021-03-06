const tileSizeInPx = 6;
mapSize = 20;
gameCanvasContext = null;
player = null;
keyDown = false;

$(document).ready(function () {
    console.log('ready');
    var playerId = localStorage.getItem('player-id');

    Meteor.call('logIn', playerId, function (error, result) {
        player = result;
        console.log('logged in');
        console.log(player);
        localStorage.setItem('player-id', player._id);
    });

    gameCanvasContext = $('#game-canvas')[0].getContext('2d');

    $('body').keydown(function (event) {
        if (!keyDown) {
            keyDown = true;

            switch (event.keyCode) {
                case 37:
                    Meteor.call('move', MOVE_DIRECTION_LEFT, function (error, result) {
                    });
                    break;
                case 38:
                    Meteor.call('move', MOVE_DIRECTION_UP, function (error, result) {
                    });
                    break;
                case 40:
                    Meteor.call('move', MOVE_DIRECTION_DOWN, function (error, result) {
                    });
                    break;
                case 39:
                    Meteor.call('move', MOVE_DIRECTION_RIGHT, function (error, result) {
                    });
                    break;
                case 32:
                    Meteor.call('toggleFighting', function (error, result) {
                    });
                    break;
            }
        }
    });

    $('body').keyup(function (event) {
        keyDown = false;
    });

    $('#game-canvas')[0].width = $('#game-canvas')[0].height = window.innerHeight;
    $(window).resize(function (e) {
        $('#game-canvas')[0].width = $('#game-canvas')[0].height = window.innerHeight;
    });
});


function drawTile(tile, player) {
    if (!gameCanvasContext) {
        return;
    }

    if (tile.type === TILE_TYPE_EMPTY) {
        gameCanvasContext.fillStyle = '#0DFF90';
    } else if (tile.type === TILE_TYPE_TREASURE) {
        gameCanvasContext.fillStyle = '#E0FF34';
    } else if (tile.type === TILE_TYPE_PLAYER) {
        if (player && player.dead) {
            gameCanvasContext.fillStyle = '#0DFF90';
        } else if (player && player.fighting) {
            gameCanvasContext.fillStyle = '#FF0000';
        } else {
            gameCanvasContext.fillStyle = '#4852FF';
        }
    } else if (tile.type === TILE_TYPE_OBSTACLE) {
        gameCanvasContext.fillStyle = '#4E4E4E';
    } else if (tile.type === TILE_TYPE_TREE) {
        gameCanvasContext.fillStyle = '#002800';
    } else if (tile.type === TILE_TYPE_WALL) {
        gameCanvasContext.fillStyle = '#540F0F';
    } else {
        return;
    }
    tileSize = $('#game-canvas')[0].width / mapSize;

    gameCanvasContext.fillRect(tile.x * tileSize, tile.y * tileSize, tileSize, tileSize);
}

Players.find().observe({
                           changed: function (player) {
                               drawTile(player.currentTile, player);
                               drawTile(player.previousTile, null);
                           }
                       });

setInterval(timeTick, 100);

function timeTick() {
    Meteor.call('keepAlive');
//    console.log('tick!');
}

setInterval(drawAllTiles, 1000);
alreadyDrawn = false;
function drawAllTiles() {
    if (gameCanvasContext) {
        Meteor.call('getTiles', function (error, result) {
            mapSize = result.length;
            for (var y = 0; y < result.length; y++) {
                var row = result[y];
                for (var x = 0; x < row.length; x++) {
                    drawTile(row[x]);
                }
            }
        });
    }
}

