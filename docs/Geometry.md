# `MRP.Geometry`

This is a JavaScript object of various game and map geometry facts. Its values
are updated automatically when the current map changes.

It has the following keys:

- `TILE_WIDTH_PX`, `TILE_HEIGHT_PX` - The pixel dimensions of each individual
  tile (i.e., the tile size). In a typical game, this will be 48x48.
- `SCREEN_WIDTH_PX`, `SCREEN_HEIGHT_PX` - The pixel width and height of the visible
  screen (i.e., the game resolution). In a typical game, this will be 816x624.
- `SCREEN_WIDTH_TILES`, `SCREEN_HEIGHT_TILES` - The number of columns and rows
  of tiles visible on the screen at one time. In a typical game, this will be
  17x13. Note that these are *not guaranteed to be whole numbers*.
- `MAP_WIDTH_TILES`, `MAP_HEIGHT_TILES` - The map size measured in tiles.
- `MAP_WIDTH_PX`, `MAP_HEIGHT_PX` - The map size measured in pixels.
- `MAP_WIDTH_PAGES`, `MAP_HEIGHT_PAGES` - The map size measured in "pages",
  that is the whole number of times we would have to move the camera in each
  direction to see the entire map.

Note that until the game begins running (see GameObserver's `game.start`
event), all of these values will be `null`. After `game.start` triggers,
`SCREEN_WIDTH_PX` and `SCREEN_HEIGHT_PX` will be populated. Once a map is
loaded, the rest of the values are populated.
