if (Meteor.isClient) {
    Template.hello.greeting = function () {
        return "Welcome to friendly.";
    };

    Template.hello.events({
        'click input': function () {
            // template data, if any, is available in 'this'
            if (typeof console !== 'undefined')
                console.log("You pressed the button");
        }
    });

    Template.game.tileRows = function () {
        var returnTiles = [];

        var tileRows = TileRows.find();
        tileRows.forEach(function (tileRow) {
            var newTileRow = [];
            tileRow.tiles.forEach(function (tileId) {
                newTileRow.push(Tiles.findOne({_id: tileId}));
            });
            returnTiles.push(newTileRow);
        });

        return returnTiles;
    };

//    Tiles.find().observe({
//        changed: function (tile) {
//            console.log('changed!');
//            var g = $('#game-canvas')[0].getContext('2d');
//            g.fillStyle = 'rgb(150,29,28)';
//            g.fillRect(tile.x*10, tile.y*10, 10, 10);
//        }
//    })
}
