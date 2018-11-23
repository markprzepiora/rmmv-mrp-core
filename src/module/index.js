import GameObserver from './game-observer';
import * as OptionParser from './option-parser';
import Geometry from './geometry';
import * as CommonEvents from './common-events';
import * as Inventory from './inventory';
import * as Database from './database';
import * as Map from './map';
import * as ChangeTextSpeed from './change-text-speed';
import * as PluginCommands from './plugin-commands';

export {
  GameObserver,
  OptionParser,
  Geometry,
  CommonEvents,
  Inventory,
  Database,
  Map,
  ChangeTextSpeed,
  PluginCommands,
};

if (Utils && Utils.isNwjs && Utils.isNwjs()) {
  const MapExporter = require('./map-exporter').default;
  const OSXFixes    = require('./osx-fixes');

  module.exports.OSXFixes = OSXFixes;
  module.exports.MapExporter = MapExporter;
}
