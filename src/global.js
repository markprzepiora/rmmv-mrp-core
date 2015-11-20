//=============================================================================
// RPG Maker MV MRP Core Module
// rmmv-mrp-core.js
// Version: 0.0.12
//=============================================================================

//=============================================================================
/*:
 * @plugindesc A collection of utilities for RPG Maker MV game designers and
 * plugin writers.
 * @author Mark Przepiora
 *
 * @help
 * ============================================================================
 * Instructions
 * ============================================================================
 *
 * Please look on GitHub for complete instructions:
 * https://github.com/markprzepiora/rmmv-mrp-core
 */
//=============================================================================

import * as MRP from './module/index';

MRP.OSXFixes.InstallAllFixes();

window.MRP = MRP;
