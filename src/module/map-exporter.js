require('blueimp-canvas-to-blob');
var saveAs = require('browser-filesaver').saveAs;

var TILE_SIZE = 48;
var TILES_X = 17;
var TILES_Y = 13;

function addScreenshotToCanvas(x, y, targetCanvas) {
  var tilesX  = x * TILES_X;
  var tilesY  = y * TILES_Y;
  var screenX = tilesX * TILE_SIZE;
  var screenY = tilesY * TILE_SIZE;

  $gameMap._displayX = tilesX;
  $gameMap._displayY = tilesY;
  SceneManager.update();
  
  var canvas = SceneManager.snap()._canvas;
  targetCanvas.getContext('2d').drawImage(canvas, screenX, screenY);
}

export default function exportMap() {
  const imageX = $dataMap.width * TILE_SIZE;
  const imageY = $dataMap.height * TILE_SIZE;
  const pagesX = Math.ceil(imageX / SceneManager._screenWidth);
  const pagesY = Math.ceil(imageY / SceneManager._screenHeight);

  // This canvas will hold the entire, big-ass image.
  const canvas = document.createElement('canvas');
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
}
