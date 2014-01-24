function timeTick() {
    console.log('tick!');
}

setInterval(timeTick, 500);

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
}

if (Meteor.isServer) {
    Meteor.startup(function () {
        // code to run on server at startup

        if (Tiles.find().fetch().length == 0) {
            const mapSize = 64;
            for (var x = 0; x < mapSize; x++) {
                for (var y = 0; y < mapSize; y++) {
                    Tiles.insert({x: x, y: y});
                    Meteor._debug('inserting tile (' + x + ', ' + y + ')');
                }
            }
        }
    });
}
