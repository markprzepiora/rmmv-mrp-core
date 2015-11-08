if (!Utils.isNwjs()) {
  throw "rmmv-mrp-core/map-exporter can only be run during development";
}

import gui from 'nw.gui';
import geometry from './geometry';
import fs from 'fs';
import path from 'path';
import { gameDir, homeDir } from './directories';

function screenshotName(basename, suffix) {
  if (!basename) {
    basename = $dataMapInfos[$gameMap._mapId].name;
  }

  const timestamp = new Date().toISOString().replace(/:/g, '-');
  basename = basename.replace(/[^a-zA-Z0-9\s]/g, '');

  return `${timestamp} ${basename} ${suffix}.png`;
}

function screenshotsDir() {
  const dir = path.join(gameDir() || homeDir(), 'MapExporter');

  try {
    fs.mkdirSync(dir);
  } catch (e) { }

  return dir;
}

function screenshotPath(basename, suffix) {
  return path.join(screenshotsDir(), screenshotName(basename, suffix));
}

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
  const tilesX = (startX + deltaX) * geometry.SCREEN_WIDTH_TILES;
  const tilesY = (startY + deltaY) * geometry.SCREEN_HEIGHT_TILES;

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

function _exportMap(startPageX, endPageX, startPageY, endPageY, basename, suffix) {
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

  const base64Data = canvas.toDataURL().replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
  fs.writeFileSync(screenshotPath(basename, suffix), base64Data, 'base64');

  $gameMap._displayY = previousDisplayY;
  $gameMap._displayX = previousDisplayX;
}

function exportMap(pagesPerImage, basename) {
  var x = 0, xCounter = 0;
  var y = 0, yCounter = 0;

  do {
    y = 0;
    yCounter = 0;

    do {
      _exportMap(x, x + pagesPerImage, y, y + pagesPerImage, basename, `${xCounter}${yCounter}`);

      y += pagesPerImage;
      yCounter++;
    } while (y + pagesPerImage <= geometry.MAP_HEIGHT_PAGES);

    x += pagesPerImage;
    xCounter++;
  } while (x + pagesPerImage <= geometry.MAP_WIDTH_PAGES);
}

export default function exportMapAsync({ pagesPerImage = 16, basename = null } = {}) {
  if (pagesPerImage <= 0) {
    throw "pagesPerImage must be > 0";
  }

  requestAnimationFrame(function() {
    exportMap(pagesPerImage, basename);
    gui.Shell.openItem(screenshotsDir());
  });
}
