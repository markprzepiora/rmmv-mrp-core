import GameObserver from './game-observer';

const geometry = {
  TILE_WIDTH_PX:       null,
  TILE_HEIGHT_PX:      null,
  SCREEN_WIDTH_PX:     null,
  SCREEN_HEIGHT_PX:    null,
  SCREEN_WIDTH_TILES:  null,
  SCREEN_HEIGHT_TILES: null,
  MAP_WIDTH_TILES:     null,
  MAP_HEIGHT_TILES:    null,
  MAP_WIDTH_PX:        null,
  MAP_HEIGHT_PX:       null,
  MAP_WIDTH_PAGES:     null,
  MAP_HEIGHT_PAGES:    null,
};

GameObserver.on('game.start', function() {
  // The pixel width and height of the visible screen (i.e. game resolution)
  // In a typical game, this will be 816x624.
  geometry.SCREEN_WIDTH_PX  = SceneManager._screenWidth;
  geometry.SCREEN_HEIGHT_PX = SceneManager._screenHeight;
});

GameObserver.on('map.setup', function() {
  // The pixel dimensions of each individual tile (i.e., tile size)
  // In a typical game, these will be 48x48.
  geometry.TILE_WIDTH_PX = $gameMap.tileWidth();
  geometry.TILE_HEIGHT_PX = $gameMap.tileHeight();

  // The number of columns and rows of tiles visible on the screen at one time.
  // In a typical game, this will be 17x13.
  //
  // Note that these are *not guaranteed to be whole numbers*.
  geometry.SCREEN_WIDTH_TILES = Math.floor(geometry.SCREEN_WIDTH_PX / geometry.TILE_WIDTH_PX);
  geometry.SCREEN_HEIGHT_TILES = Math.floor(geometry.SCREEN_HEIGHT_PX / geometry.TILE_HEIGHT_PX);

  // The map size measured in tiles.
  geometry.MAP_WIDTH_TILES  = $dataMap.width;
  geometry.MAP_HEIGHT_TILES = $dataMap.height;

  // The map size measured in pixels.
  geometry.MAP_WIDTH_PX  = geometry.MAP_WIDTH_TILES * geometry.TILE_WIDTH_PX;
  geometry.MAP_HEIGHT_PX = geometry.MAP_HEIGHT_TILES * geometry.TILE_HEIGHT_PX;

  // The map size measured in `pages`, that is the whole number of times we
  // would have to move the camera in each direction to see the entire map.
  geometry.MAP_WIDTH_PAGES  = Math.ceil(geometry.MAP_WIDTH_PX / geometry.SCREEN_WIDTH_PX);
  geometry.MAP_HEIGHT_PAGES = Math.ceil(geometry.MAP_HEIGHT_PX / geometry.SCREEN_HEIGHT_PX);
});

export default geometry;
