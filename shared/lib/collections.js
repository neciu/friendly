TILE_TYPE_EMPTY = 0;
TILE_TYPE_PLAYER = 1;
TILE_TYPE_TREASURE = 2;
TILE_TYPE_OBSTACLE = 3;

Players = new Meteor.Collection('players');
Treasures = new Meteor.Collection('treasures');

MOVE_DIRECTION_NONE = 0;
MOVE_DIRECTION_UP = 1;
MOVE_DIRECTION_DOWN = 2;
MOVE_DIRECTION_LEFT = 3;
MOVE_DIRECTION_RIGHT = 4;
