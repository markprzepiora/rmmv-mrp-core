//=============================================================================
// RPG Maker MV MRP Core - Fix Copy/Paste and stuck Dev Tools window on OSX
// rmmv-mrp-core--osx-fixes.js
// Version: 0.0.11
//=============================================================================

//=============================================================================
/*:
 * @plugindesc Fix Copy/Paste and stuck Dev Tools window on OSX
 * @author Mark Przepiora
 *
 * @help
 * ============================================================================
 * Instructions
 * ============================================================================
 *
 * No configuration or usage required. If you are on OSX, this plugin will
 * re-enable copy/paste inside the Dev Tools window, and also move it over down
 * and to the right a little bit so that its menu bar becomes visible.
 *
 * Please look on GitHub for complete instructions:
 * https://github.com/markprzepiora/rmmv-mrp-core
 */
//=============================================================================

import * as OSXFixes from './module/osx-fixes';

if (!window.MRP) {
  window.MRP = {};
}

OSXFixes.InstallAllFixes();

window.MRP.OSXFixes = OSXFixes;
