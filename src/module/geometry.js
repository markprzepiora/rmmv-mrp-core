export default function getGeometry() {
  const geometry = {};

  // The pixel dimensions of each individual tile (i.e., tile size)
  // In a typical game, these will be 48x48.
  geometry.TILE_WIDTH = $gameMap.tileWidth();
  geometry.TILE_HEIGHT = $gameMap.tileHeight();

  // The pixel width and height of the visible screen (i.e. game resolution)
  // In a typical game, this will be 816x624.
  geometry.SCREEN_WIDTH_PX = SceneManager._screenWidth;
  geometry.SCREEN_HEIGHT_PX = SceneManager._screenHeight;

  // The number of columns and rows of tiles visible on the screen at one time.
  // In a typical game, this will be 17x13.
  //
  // Note that these are *not guaranteed to be whole numbers*.
  geometry.TILES_X = Math.floor(geometry.SCREEN_WIDTH_PX / geometry.TILE_WIDTH);
  geometry.TILES_Y = Math.floor(geometry.SCREEN_HEIGHT_PX / geometry.TILE_HEIGHT);

  // The map size measured in tiles.
  geometry.MAP_WIDTH_TILES  = $dataMap.width;
  geometry.MAP_HEIGHT_TILES = $dataMap.height;

  // The map size measured in pixels.
  geometry.MAP_WIDTH_PX  = geometry.MAP_WIDTH_TILES * geometry.TILE_WIDTH;
  geometry.MAP_HEIGHT_PX = geometry.MAP_HEIGHT_TILES * geometry.TILE_HEIGHT;

  // The map size measured in `pages`, that is the whole number of times we
  // would have to move the camera in each direction to see the entire map.
  geometry.MAP_WIDTH_PAGES  = Math.ceil(geometry.MAP_WIDTH_PX / geometry.SCREEN_WIDTH_PX);
  geometry.MAP_HEIGHT_PAGES = Math.ceil(geometry.MAP_HEIGHT_PX / geometry.SCREEN_HEIGHT_PX);

  return geometry;
}
