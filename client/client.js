const tileSizeInPx = 8;
gameCanvasContext = null;
player = null;

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
        }
    });
});


Meteor.startup(function () {
    Tiles.find().forEach(function (tile) {
        drawTile(tile);
    });
});

function drawTile(tile) {
    if (tile.type === TILE_TYPE_EMPTY) {
        gameCanvasContext.fillStyle = '#0DFF90';
    } else if (tile.type === TILE_TYPE_TREASURE) {
        gameCanvasContext.fillStyle = '#E0FF34';
    } else if (tile.type === TILE_TYPE_PLAYER) {
        gameCanvasContext.fillStyle = '#4852FF';
    } else if (tile.type === TILE_TYPE_OBSTACLE) {
        gameCanvasContext.fillStyle = '#000000';
    } else {
        return;
    }

    gameCanvasContext.fillRect(tile.x * tileSizeInPx, tile.y * tileSizeInPx, tileSizeInPx, tileSizeInPx);
}

Tiles.find().observe({
    changed: function (tile) {
        drawTile(tile);
    }
});

setInterval(timeTick, 100);

function timeTick() {
    Meteor.call('keepAlive');
//    console.log('tick!');
}

setInterval(drawAllTiles, 100);
alreadyDrawn = false;
function drawAllTiles() {
    if (gameCanvasContext && !alreadyDrawn) {
        Tiles.find().forEach(function (tile) {
            drawTile(tile);
        });
    }
}

