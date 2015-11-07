require('blueimp-canvas-to-blob');
var saveAs = require('browser-filesaver').saveAs;

import geometry from './geometry';

// startX, deltaX, startY, deltaY are measured in *pages*.
//
// We're taking a screenshot at page startX + deltaX and startY + delta Y, but
// we're pasting it into an image where its zero coordinates are startX and
// startY.
//
// Imagine the picture below. The outside box represents the entire map. The
// dotted box represents the big image we're generating. The inner solid box
// represents the current screenshot we're taking and pasting inside of the
// dotted box.
// 
//            startX↓      ↓startX + deltaX
//
//            |-------------------------|
//            |                         |
//            |                         |
//   startY→  |     .......--------     |
//            |     .      |      |     |
//            |     .      |      |     |
//            |     .      --------     | ← startY + deltaY
//            |     .             .     |
//            |     .             .     |
//            |     ...............     |
//            |                         |
//            |                         |
//            |-------------------------|
function addScreenshotToCanvas(startX, deltaX, startY, deltaY, targetCanvas) {
  // The number of pages we're moving the camera from the origin.
  const tilesX = (startX + deltaX) * geometry.TILES_X;
  const tilesY = (startY + deltaY) * geometry.TILES_Y;

  // The pixel position in the image into which we're pasting the screenshot.
  const imageX = deltaX * geometry.SCREEN_WIDTH_PX;
  const imageY = deltaY * geometry.SCREEN_HEIGHT_PX;

  $gameMap._displayX = tilesX;
  $gameMap._displayY = tilesY;
  SceneManager.updateScene();
  SceneManager.renderScene();
  
  var canvas = SceneManager.snap()._canvas;
  targetCanvas.getContext('2d').drawImage(canvas, imageX, imageY);
}

// Includes pages [startPage, startPage + 1, ..., endPage - 1]
function imageSize(startPage, endPage, screenSizePx, mapSizePx) {
  // Example:
  //   startPage    = 1
  //   endPage      = 2
  //   screenSizePx = 1000
  //   mapSizePx    = 1800

  // totalPages = ceil(1.8) = 2
  var totalPages = Math.ceil(mapSizePx / screenSizePx);

  // startPage = 1
  startPage = Math.min(startPage, totalPages);

  // startPage = 2
  endPage = Math.min(endPage, totalPages);

  // 1 >= 2 ?
  if (startPage >= endPage) {
    throw `tried to compute a width or height of size 0: ${JSON.stringify([].slice.apply(arguments))}`;
  }

  // 2 === 2 ?
  if (endPage === totalPages) {
    var size =
      // 0 + (1800 % 1000) || 1000
      // = 800
      (endPage - startPage - 1) * screenSizePx +
      ((mapSizePx % screenSizePx) || screenSizePx);
  } else {
    var size = (endPage - startPage) * screenSizePx;
  }

  return size;
}

function exportMap(startPageX, endPageX, startPageY, endPageY) {
  // The pixel resolution of the image we are creating.

  startPageX = Math.min(startPageX, geometry.MAP_WIDTH_PAGES);
  endPageX   = Math.min(endPageX,   geometry.MAP_WIDTH_PAGES);
  startPageY = Math.min(startPageY, geometry.MAP_HEIGHT_PAGES);
  endPageY   = Math.min(endPageY,   geometry.MAP_HEIGHT_PAGES);

  const imageX = imageSize(startPageX, endPageX, geometry.SCREEN_WIDTH_PX, geometry.MAP_WIDTH_PX);
  const imageY = imageSize(startPageY, endPageY, geometry.SCREEN_HEIGHT_PX, geometry.MAP_HEIGHT_PX);

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
  var x, y;
  for (x = startPageX; x < endPageX; x++) {
    for (y = startPageY; y < endPageY; y++) {
      addScreenshotToCanvas(startPageX, x - startPageX, startPageY, y - startPageY, canvas);
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

export default function exportMapAsync(...args) {
  requestAnimationFrame(function() {
    exportMap(0, geometry.MAP_WIDTH_PAGES, 0, geometry.MAP_HEIGHT_PAGES);
  });
}
