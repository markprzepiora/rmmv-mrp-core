require('blueimp-canvas-to-blob');
var saveAs = require('browser-filesaver').saveAs;

function getGeometry() {
  return {
    TILE_WIDTH:       $gameMap.tileWidth(),
    TILE_HEIGHT:      $gameMap.tileHeight(),
    TILES_X:          Math.floor(SceneManager._screenWidth / $gameMap.tileWidth()),
    TILES_Y:          Math.floor(SceneManager._screenHeight / $gameMap.tileHeight()),
    SCREEN_WIDTH_PX:  SceneManager._screenWidth,
    SCREEN_HEIGHT_PX: SceneManager._screenHeight,
  }
}

function addScreenshotToCanvas(x, y, targetCanvas) {
  const geometry = getGeometry();
  const tilesX   = x * geometry.TILES_X;
  const tilesY   = y * geometry.TILES_Y;
  const screenX  = tilesX * geometry.TILE_WIDTH;
  const screenY  = tilesY * geometry.TILE_HEIGHT;

  $gameMap._displayX = tilesX;
  $gameMap._displayY = tilesY;
  SceneManager.updateScene();
  SceneManager.renderScene();
  
  var canvas = SceneManager.snap()._canvas;
  targetCanvas.getContext('2d').drawImage(canvas, screenX, screenY);
}

function exportMap() {
  const geometry = getGeometry();
  const imageX   = $dataMap.width * geometry.TILE_WIDTH;
  const imageY   = $dataMap.height * geometry.TILE_HEIGHT;
  const pagesX   = Math.ceil(imageX / geometry.SCREEN_WIDTH_PX);
  const pagesY   = Math.ceil(imageY / geometry.SCREEN_HEIGHT_PX);

  const previousDisplayX = $gameMap._displayX;
  const previousDisplayY = $gameMap._displayY;

  // This canvas will hold the entire, big-ass image.
  const canvas  = document.createElement('canvas');
  canvas.width  = imageX;
  canvas.height = imageY;

  // Set the player's opacity to zero so that we don't include it in the image.
  const originalOpacity = $gamePlayer._opacity;
  $gamePlayer._opacity = 0;

  // Take a screenshot of each portion of the map and layer them onto the big
  // canvas.
  var x = 0;
  var y = 0;
  for (x = 0; x < pagesX; x++) {
    for (y = 0; y < pagesY; y++) {
      addScreenshotToCanvas(x, y, canvas);
    }
  }

  // Restore the player's opacity.
  $gamePlayer._opacity = originalOpacity;

  // Save the result to a file and download it.
  canvas.toBlob(function(blob) {
    saveAs(blob, "map.png");
  });

  $gameMap._displayY = previousDisplayY;
  $gameMap._displayX = previousDisplayX;
}

export default function exportMapAsync() {
  requestAnimationFrame(exportMap);
}
