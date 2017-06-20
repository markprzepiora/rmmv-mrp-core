//=============================================================================
// RPG Maker MV MRP Option Parser
// rmmv-mrp-core--option-parser.js
// Version: 0.0.16
//=============================================================================

//=============================================================================
/*:
 * @plugindesc Parse note tags written in a familiar, human-readable syntax.
 *
 * @author Mark Przepiora
 *
 * @help
 * ============================================================================
 * Instructions
 * ============================================================================
 *
 * Please see the full documentation here:
 * https://github.com/markprzepiora/rmmv-mrp-core/blob/master/docs/OptionParser.md
 *
 * This function is part of the rmmv-mrp-core library, but this file
 * (rmmv-mrp-core--option-parser.js) is a standalone bundle containing only the
 * OptionParser. If you are interested in using the rest of the utilities in
 * rmmv-mrp-core, then you should instead add the rmmv-mrp-core.js bundle as a
 * plugin, as that file includes this and all the other core modules.
 */
//=============================================================================

import * as OptionParser from './module/option-parser';

if (!window.MRP) {
  window.MRP = {};
}

window.MRP.OptionParser = OptionParser;
