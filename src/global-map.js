//=============================================================================
// RPG Maker MV MRP Map Utils
// rmmv-mrp-core--map.js
// Version: 0.0.16
//=============================================================================

//=============================================================================
/*:
 * @plugindesc Find and manipulate data about the current map.
 * @author Mark Przepiora
 *
 * @help
 * ============================================================================
 * Instructions
 * ============================================================================
 *
 * Please look on GitHub for complete instructions:
 * https://github.com/markprzepiora/rmmv-mrp-core/blob/master/docs/Map.md
 */
//=============================================================================

import Map from './module/map';

if (!window.MRP) {
  window.MRP = {};
}

window.MRP.Map = Map;
