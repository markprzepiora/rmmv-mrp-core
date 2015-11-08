import GameObserver from './game-observer';
import * as OptionParser from './option-parser';
import Geometry from './geometry';

export { GameObserver, OptionParser, Geometry };

if (Utils.isNwjs()) {
  const MapExporter = require('./map-exporter').default;
  const OSXFixes    = require('./osx-fixes');

  module.exports.OSXFixes = OSXFixes;
  module.exports.MapExporter = MapExporter;
}
