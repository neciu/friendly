Tiles = new Meteor.Collection('tiles');

TILE_TYPE_EMPTY = 0;
TILE_TYPE_PLAYER = 1;
TILE_TYPE_TREASURE = 2;
TILE_TYPE_OBSTACLE = 3;

TileRows = new Meteor.Collection('tilerows');
Players = new Meteor.Collection('players');

MOVE_DIRECTION_UP = 0;
MOVE_DIRECTION_DOWN = 1;
MOVE_DIRECTION_LEFT = 2;
MOVE_DIRECTION_RIGHT = 3;
