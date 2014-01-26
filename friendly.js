if (Meteor.isClient) {
    Template.game.myScore = function () {
        var player = Players.findOne({_id: localStorage.getItem('player-id')});
        if (player) {
            return player.score;
        }
    };

    Template.game.players = function () {
        return Players.find().fetch();
    };
}
