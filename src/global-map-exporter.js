//=============================================================================
// RPG Maker MV MRP Map Exporter
// rmmv-mrp-core--map-exporter.js
// Version: 0.0.8
//=============================================================================

//=============================================================================
/*:
 * @plugindesc Export the entire current game map as a PNG file.
 * @author Mark Przepiora
 *
 * @help
 * ============================================================================
 * Instructions
 * ============================================================================
 *
 * Simply run,
 *
 *     MRP.MapExporter();
 *
 * from a JavaScript console or an event. A PNG file named map.png will be
 * downloaded to your computer containing the entire map, including events, but
 * not including your character.
 *
 * Should work just fine with custom tile sizes and resolutions, but that is
 * untested.
 *
 * This function is part of the rmmv-mrp-core library, but this file
 * (rmmv-mrp-core--map-exporter.js) is a standalone bundle containing only the
 * MapExporter. If you are interested in using the rest of the utilities in
 * rmmv-mrp-core, then you should instead add the rmmv-mrp-core.js bundle as a
 * plugin, as that file includes this and all the other core modules.
 *
 * Please look on GitHub for complete instructions:
 * https://github.com/markprzepiora/rmmv-mrp-core
 */
//=============================================================================

import MapExporter from './module/map-exporter';

if (!window.MRP) {
  window.MRP = {};
}

window.MRP.MapExporter = MapExporter;
