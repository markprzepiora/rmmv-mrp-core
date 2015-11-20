(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var d        = require('d')
  , callable = require('es5-ext/object/valid-callable')

  , apply = Function.prototype.apply, call = Function.prototype.call
  , create = Object.create, defineProperty = Object.defineProperty
  , defineProperties = Object.defineProperties
  , hasOwnProperty = Object.prototype.hasOwnProperty
  , descriptor = { configurable: true, enumerable: false, writable: true }

  , on, once, off, emit, methods, descriptors, base;

on = function (type, listener) {
	var data;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) {
		data = descriptor.value = create(null);
		defineProperty(this, '__ee__', descriptor);
		descriptor.value = null;
	} else {
		data = this.__ee__;
	}
	if (!data[type]) data[type] = listener;
	else if (typeof data[type] === 'object') data[type].push(listener);
	else data[type] = [data[type], listener];

	return this;
};

once = function (type, listener) {
	var once, self;

	callable(listener);
	self = this;
	on.call(this, type, once = function () {
		off.call(self, type, once);
		apply.call(listener, this, arguments);
	});

	once.__eeOnceListener__ = listener;
	return this;
};

off = function (type, listener) {
	var data, listeners, candidate, i;

	callable(listener);

	if (!hasOwnProperty.call(this, '__ee__')) return this;
	data = this.__ee__;
	if (!data[type]) return this;
	listeners = data[type];

	if (typeof listeners === 'object') {
		for (i = 0; (candidate = listeners[i]); ++i) {
			if ((candidate === listener) ||
					(candidate.__eeOnceListener__ === listener)) {
				if (listeners.length === 2) data[type] = listeners[i ? 0 : 1];
				else listeners.splice(i, 1);
			}
		}
	} else {
		if ((listeners === listener) ||
				(listeners.__eeOnceListener__ === listener)) {
			delete data[type];
		}
	}

	return this;
};

emit = function (type) {
	var i, l, listener, listeners, args;

	if (!hasOwnProperty.call(this, '__ee__')) return;
	listeners = this.__ee__[type];
	if (!listeners) return;

	if (typeof listeners === 'object') {
		l = arguments.length;
		args = new Array(l - 1);
		for (i = 1; i < l; ++i) args[i - 1] = arguments[i];

		listeners = listeners.slice();
		for (i = 0; (listener = listeners[i]); ++i) {
			apply.call(listener, this, args);
		}
	} else {
		switch (arguments.length) {
		case 1:
			call.call(listeners, this);
			break;
		case 2:
			call.call(listeners, this, arguments[1]);
			break;
		case 3:
			call.call(listeners, this, arguments[1], arguments[2]);
			break;
		default:
			l = arguments.length;
			args = new Array(l - 1);
			for (i = 1; i < l; ++i) {
				args[i - 1] = arguments[i];
			}
			apply.call(listeners, this, args);
		}
	}
};

methods = {
	on: on,
	once: once,
	off: off,
	emit: emit
};

descriptors = {
	on: d(on),
	once: d(once),
	off: d(off),
	emit: d(emit)
};

base = defineProperties({}, descriptors);

module.exports = exports = function (o) {
	return (o == null) ? create(base) : defineProperties(Object(o), descriptors);
};
exports.methods = methods;

},{"d":2,"es5-ext/object/valid-callable":11}],2:[function(require,module,exports){
'use strict';

var assign        = require('es5-ext/object/assign')
  , normalizeOpts = require('es5-ext/object/normalize-options')
  , isCallable    = require('es5-ext/object/is-callable')
  , contains      = require('es5-ext/string/#/contains')

  , d;

d = module.exports = function (dscr, value/*, options*/) {
	var c, e, w, options, desc;
	if ((arguments.length < 2) || (typeof dscr !== 'string')) {
		options = value;
		value = dscr;
		dscr = null;
	} else {
		options = arguments[2];
	}
	if (dscr == null) {
		c = w = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
		w = contains.call(dscr, 'w');
	}

	desc = { value: value, configurable: c, enumerable: e, writable: w };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

d.gs = function (dscr, get, set/*, options*/) {
	var c, e, options, desc;
	if (typeof dscr !== 'string') {
		options = set;
		set = get;
		get = dscr;
		dscr = null;
	} else {
		options = arguments[3];
	}
	if (get == null) {
		get = undefined;
	} else if (!isCallable(get)) {
		options = get;
		get = set = undefined;
	} else if (set == null) {
		set = undefined;
	} else if (!isCallable(set)) {
		options = set;
		set = undefined;
	}
	if (dscr == null) {
		c = true;
		e = false;
	} else {
		c = contains.call(dscr, 'c');
		e = contains.call(dscr, 'e');
	}

	desc = { get: get, set: set, configurable: c, enumerable: e };
	return !options ? desc : assign(normalizeOpts(options), desc);
};

},{"es5-ext/object/assign":3,"es5-ext/object/is-callable":6,"es5-ext/object/normalize-options":10,"es5-ext/string/#/contains":13}],3:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.assign
	: require('./shim');

},{"./is-implemented":4,"./shim":5}],4:[function(require,module,exports){
'use strict';

module.exports = function () {
	var assign = Object.assign, obj;
	if (typeof assign !== 'function') return false;
	obj = { foo: 'raz' };
	assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
	return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
};

},{}],5:[function(require,module,exports){
'use strict';

var keys  = require('../keys')
  , value = require('../valid-value')

  , max = Math.max;

module.exports = function (dest, src/*, …srcn*/) {
	var error, i, l = max(arguments.length, 2), assign;
	dest = Object(value(dest));
	assign = function (key) {
		try { dest[key] = src[key]; } catch (e) {
			if (!error) error = e;
		}
	};
	for (i = 1; i < l; ++i) {
		src = arguments[i];
		keys(src).forEach(assign);
	}
	if (error !== undefined) throw error;
	return dest;
};

},{"../keys":7,"../valid-value":12}],6:[function(require,module,exports){
// Deprecated

'use strict';

module.exports = function (obj) { return typeof obj === 'function'; };

},{}],7:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? Object.keys
	: require('./shim');

},{"./is-implemented":8,"./shim":9}],8:[function(require,module,exports){
'use strict';

module.exports = function () {
	try {
		Object.keys('primitive');
		return true;
	} catch (e) { return false; }
};

},{}],9:[function(require,module,exports){
'use strict';

var keys = Object.keys;

module.exports = function (object) {
	return keys(object == null ? object : Object(object));
};

},{}],10:[function(require,module,exports){
'use strict';

var forEach = Array.prototype.forEach, create = Object.create;

var process = function (src, obj) {
	var key;
	for (key in src) obj[key] = src[key];
};

module.exports = function (options/*, …options*/) {
	var result = create(null);
	forEach.call(arguments, function (options) {
		if (options == null) return;
		process(Object(options), result);
	});
	return result;
};

},{}],11:[function(require,module,exports){
'use strict';

module.exports = function (fn) {
	if (typeof fn !== 'function') throw new TypeError(fn + " is not a function");
	return fn;
};

},{}],12:[function(require,module,exports){
'use strict';

module.exports = function (value) {
	if (value == null) throw new TypeError("Cannot use null or undefined");
	return value;
};

},{}],13:[function(require,module,exports){
'use strict';

module.exports = require('./is-implemented')()
	? String.prototype.contains
	: require('./shim');

},{"./is-implemented":14,"./shim":15}],14:[function(require,module,exports){
'use strict';

var str = 'razdwatrzy';

module.exports = function () {
	if (typeof str.contains !== 'function') return false;
	return ((str.contains('dwa') === true) && (str.contains('foo') === false));
};

},{}],15:[function(require,module,exports){
'use strict';

var indexOf = String.prototype.indexOf;

module.exports = function (searchString/*, position*/) {
	return indexOf.call(this, searchString, arguments[1]) > -1;
};

},{}],16:[function(require,module,exports){
'use strict';

var _index = require('./module/index');

var MRP = _interopRequireWildcard(_index);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

MRP.OSXFixes.InstallAllFixes(); //=============================================================================
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

window.MRP = MRP;

},{"./module/index":20}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.gameDir = gameDir;
exports.homeDir = homeDir;

var _nw = require('nw.gui');

var _nw2 = _interopRequireDefault(_nw);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function gameDir() {
  var args = _nw2.default.App.fullArgv;
  var uriMatch = args.map(function (s) {
    return s.match(/file:\/\/.*/);
  })[0];

  // On Windows, we do not want the leading slash to end up in the filename, so
  // we hack it off.
  var sliceIndex = _os2.default.platform() === 'win32' ? 8 : 7;

  if (uriMatch) {
    return _path2.default.dirname(decodeURI(uriMatch[0].slice(sliceIndex)));
  } else {
    return null;
  }
}

function homeDir() {
  return window.process.env.HOME || window.process.env.USERPROFILE;
}

},{"nw.gui":undefined,"os":undefined,"path":undefined}],18:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventEmitter = require("event-emitter");

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Example:
//
//   GameObserver.on('turn.start', function() {
//     // do whatever...
//   });

var GameObserver = (0, _eventEmitter2.default)({});

function overridePrototypeMethod(constructor, functionName, fn) {
  var _super = constructor.prototype[functionName];
  constructor.prototype[functionName] = function () {
    return fn.apply(undefined, [_super.bind(this)].concat(Array.prototype.slice.call(arguments)));
  };
}

function overrideSingletonMethod(object, functionName, fn) {
  var _super = object[functionName];
  object[functionName] = function () {
    return fn.apply(undefined, [_super.bind(object)].concat(Array.prototype.slice.call(arguments)));
  };
}

function eventize(decorator, constructor, functionName, eventName) {
  decorator(constructor, functionName, function (_super) {
    GameObserver.emit(eventName + ".before");

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    _super.apply(undefined, args);
    GameObserver.emit(eventName + ".after");
    GameObserver.emit(eventName);
  });
}

function eventizePrototypeMethod(constructor, functionName, eventName) {
  eventize(overridePrototypeMethod, constructor, functionName, eventName);
}

function eventizeSingletonMethod(object, functionName, eventName) {
  eventize(overrideSingletonMethod, object, functionName, eventName);
}

eventizePrototypeMethod(Game_Troop, 'onBattleStart', 'battle.start');
eventizePrototypeMethod(Game_Troop, 'onBattleEnd', 'battle.end');
eventizePrototypeMethod(Game_Map, 'setup', 'map.setup');
eventizeSingletonMethod(BattleManager, 'endTurn', 'turn.end');
eventizeSingletonMethod(BattleManager, 'startTurn', 'turn.start');
eventizeSingletonMethod(SceneManager, 'run', 'game.start');

exports.default = GameObserver;

},{"event-emitter":1}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gameObserver = require('./game-observer');

var _gameObserver2 = _interopRequireDefault(_gameObserver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var geometry = {
  TILE_WIDTH_PX: null,
  TILE_HEIGHT_PX: null,
  SCREEN_WIDTH_PX: null,
  SCREEN_HEIGHT_PX: null,
  SCREEN_WIDTH_TILES: null,
  SCREEN_HEIGHT_TILES: null,
  MAP_WIDTH_TILES: null,
  MAP_HEIGHT_TILES: null,
  MAP_WIDTH_PX: null,
  MAP_HEIGHT_PX: null,
  MAP_WIDTH_PAGES: null,
  MAP_HEIGHT_PAGES: null
};

_gameObserver2.default.on('game.start', function () {
  // The pixel width and height of the visible screen (i.e. game resolution)
  // In a typical game, this will be 816x624.
  geometry.SCREEN_WIDTH_PX = SceneManager._screenWidth;
  geometry.SCREEN_HEIGHT_PX = SceneManager._screenHeight;
});

_gameObserver2.default.on('map.setup', function () {
  // The pixel dimensions of each individual tile (i.e., tile size)
  // In a typical game, these will be 48x48.
  geometry.TILE_WIDTH_PX = $gameMap.tileWidth();
  geometry.TILE_HEIGHT_PX = $gameMap.tileHeight();

  // The number of columns and rows of tiles visible on the screen at one time.
  // In a typical game, this will be 17x13.
  //
  // Note that these are *not guaranteed to be whole numbers*.
  geometry.SCREEN_WIDTH_TILES = Math.floor(geometry.SCREEN_WIDTH_PX / geometry.TILE_WIDTH_PX);
  geometry.SCREEN_HEIGHT_TILES = Math.floor(geometry.SCREEN_HEIGHT_PX / geometry.TILE_HEIGHT_PX);

  // The map size measured in tiles.
  geometry.MAP_WIDTH_TILES = $dataMap.width;
  geometry.MAP_HEIGHT_TILES = $dataMap.height;

  // The map size measured in pixels.
  geometry.MAP_WIDTH_PX = geometry.MAP_WIDTH_TILES * geometry.TILE_WIDTH_PX;
  geometry.MAP_HEIGHT_PX = geometry.MAP_HEIGHT_TILES * geometry.TILE_HEIGHT_PX;

  // The map size measured in `pages`, that is the whole number of times we
  // would have to move the camera in each direction to see the entire map.
  geometry.MAP_WIDTH_PAGES = Math.ceil(geometry.MAP_WIDTH_PX / geometry.SCREEN_WIDTH_PX);
  geometry.MAP_HEIGHT_PAGES = Math.ceil(geometry.MAP_HEIGHT_PX / geometry.SCREEN_HEIGHT_PX);
});

exports.default = geometry;

},{"./game-observer":18}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Geometry = exports.OptionParser = exports.GameObserver = undefined;

var _gameObserver = require('./game-observer');

var _gameObserver2 = _interopRequireDefault(_gameObserver);

var _optionParser = require('./option-parser');

var OptionParser = _interopRequireWildcard(_optionParser);

var _geometry = require('./geometry');

var _geometry2 = _interopRequireDefault(_geometry);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.GameObserver = _gameObserver2.default;
exports.OptionParser = OptionParser;
exports.Geometry = _geometry2.default;

if (Utils.isNwjs()) {
  var MapExporter = require('./map-exporter').default;
  var OSXFixes = require('./osx-fixes');

  module.exports.OSXFixes = OSXFixes;
  module.exports.MapExporter = MapExporter;
}

},{"./game-observer":18,"./geometry":19,"./map-exporter":21,"./option-parser":22,"./osx-fixes":24}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exportMapAsync;

var _nw = require('nw.gui');

var _nw2 = _interopRequireDefault(_nw);

var _geometry = require('./geometry');

var _geometry2 = _interopRequireDefault(_geometry);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _directories = require('./directories');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!Utils.isNwjs()) {
  throw "rmmv-mrp-core/map-exporter can only be run during development";
}

function screenshotName(basename, suffix) {
  if (!basename) {
    basename = $dataMapInfos[$gameMap._mapId].name;
  }

  var timestamp = new Date().toISOString().replace(/:/g, '-');
  basename = basename.replace(/[^a-zA-Z0-9\s]/g, '');

  return timestamp + ' ' + basename + ' ' + suffix + '.png';
}

function screenshotsDir() {
  var dir = _path2.default.join((0, _directories.gameDir)() || (0, _directories.homeDir)(), 'MapExporter');

  try {
    _fs2.default.mkdirSync(dir);
  } catch (e) {}

  return dir;
}

function screenshotPath(basename, suffix) {
  return _path2.default.join(screenshotsDir(), screenshotName(basename, suffix));
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
  var tilesX = (startX + deltaX) * _geometry2.default.SCREEN_WIDTH_TILES;
  var tilesY = (startY + deltaY) * _geometry2.default.SCREEN_HEIGHT_TILES;

  // The pixel position in the image into which we're pasting the screenshot.
  var imageX = deltaX * _geometry2.default.SCREEN_WIDTH_PX;
  var imageY = deltaY * _geometry2.default.SCREEN_HEIGHT_PX;

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
    throw 'tried to compute a width or height of size 0: ' + JSON.stringify([].slice.apply(arguments));
  }

  // 2 === 2 ?
  if (endPage === totalPages) {
    var size =
    // 0 + (1800 % 1000) || 1000
    // = 800
    (endPage - startPage - 1) * screenSizePx + (mapSizePx % screenSizePx || screenSizePx);
  } else {
    var size = (endPage - startPage) * screenSizePx;
  }

  return size;
}

function _exportMap(startPageX, endPageX, startPageY, endPageY, basename, suffix) {
  startPageX = Math.min(startPageX, _geometry2.default.MAP_WIDTH_PAGES);
  endPageX = Math.min(endPageX, _geometry2.default.MAP_WIDTH_PAGES);
  startPageY = Math.min(startPageY, _geometry2.default.MAP_HEIGHT_PAGES);
  endPageY = Math.min(endPageY, _geometry2.default.MAP_HEIGHT_PAGES);

  var imageX = imageSize(startPageX, endPageX, _geometry2.default.SCREEN_WIDTH_PX, _geometry2.default.MAP_WIDTH_PX);
  var imageY = imageSize(startPageY, endPageY, _geometry2.default.SCREEN_HEIGHT_PX, _geometry2.default.MAP_HEIGHT_PX);

  var previousDisplayX = $gameMap._displayX;
  var previousDisplayY = $gameMap._displayY;

  // This canvas will hold the entire, big-ass image.
  var canvas = document.createElement('canvas');
  canvas.width = imageX;
  canvas.height = imageY;

  // Set the player's opacity to zero so that we don't include it in the image.
  var originalOpacity = $gamePlayer._opacity;
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

  var base64Data = canvas.toDataURL().replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
  _fs2.default.writeFileSync(screenshotPath(basename, suffix), base64Data, 'base64');

  $gameMap._displayY = previousDisplayY;
  $gameMap._displayX = previousDisplayX;
}

function exportMap(pagesPerImage, basename) {
  var x = 0,
      xCounter = 0;
  var y = 0,
      yCounter = 0;

  do {
    y = 0;
    yCounter = 0;

    do {
      _exportMap(x, x + pagesPerImage, y, y + pagesPerImage, basename, '' + xCounter + yCounter);

      y += pagesPerImage;
      yCounter++;
    } while (y + pagesPerImage <= _geometry2.default.MAP_HEIGHT_PAGES);

    x += pagesPerImage;
    xCounter++;
  } while (x + pagesPerImage <= _geometry2.default.MAP_WIDTH_PAGES);
}

function exportMapAsync() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$pagesPerImage = _ref.pagesPerImage;
  var pagesPerImage = _ref$pagesPerImage === undefined ? 16 : _ref$pagesPerImage;
  var _ref$basename = _ref.basename;
  var basename = _ref$basename === undefined ? null : _ref$basename;

  if (pagesPerImage <= 0) {
    throw "pagesPerImage must be > 0";
  }

  requestAnimationFrame(function () {
    exportMap(pagesPerImage, basename);
    _nw2.default.Shell.openItem(screenshotsDir());
  });
}

},{"./directories":17,"./geometry":19,"fs":undefined,"nw.gui":undefined,"path":undefined}],22:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractFirst = undefined;
exports.parse = parse;
exports.extractAll = extractAll;
exports.extractFirstOfType = extractFirstOfType;
exports.extractAllOfType = extractAllOfType;

var _lexerUtils = require('./lexer-utils');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

var BRA = (0, _lexerUtils.regex)('BRA', /</);
var KET = (0, _lexerUtils.regex)('KET', />/);
var WHITESPACE = (0, _lexerUtils.skip)((0, _lexerUtils.regex)('WHITESPACE', /\s+/));
var IDENTIFIER = (0, _lexerUtils.regex)('IDENTIFIER', /[a-zA-Z_][a-zA-Z0-9-_]*/);
var KEY = (0, _lexerUtils.regex)('KEY', /[a-zA-Z_][a-zA-Z0-9-_]*/);
var KEYVALSEP = (0, _lexerUtils.regex)('KEYVALSEP', /:/);
var KEYVAL = (0, _lexerUtils.seq)(KEY, (0, _lexerUtils.optional)(WHITESPACE), KEYVALSEP);

// Bare strings are complicated because we need to allow commas between key
// value pairs to be optional. So in the following string,
//
//     foo bar baz: 10
//
// we want to match 'foo bar', not 'foo bar baz'

var SIGNIFICANT_WHITESPACE = (0, _lexerUtils.regex)('SIGNIFICANT_WHITESPACE', /\s+/);
var BAREWORD = (0, _lexerUtils.regex)('BAREWORD', /[^,:><"\s]+/);

var BARESTRING = (0, _lexerUtils.concat)('BARESTRING', (0, _lexerUtils.seq)(BAREWORD, (0, _lexerUtils.repeat)((0, _lexerUtils.notFollowedBy)((0, _lexerUtils.seq)(SIGNIFICANT_WHITESPACE, BAREWORD), (0, _lexerUtils.seq)((0, _lexerUtils.optional)(WHITESPACE), KEYVALSEP)))));

var parseStringLiteral = function parseStringLiteral(str) {
  return JSON.parse(str.replace(/\n/g, '\\n'));
};

var COMMA = (0, _lexerUtils.regex)('COMMA', /,/);
var NUMBER = (0, _lexerUtils.regex)('NUMBER', /-?[0-9]+(\.[0-9]+)?/);
var BOOLEAN = (0, _lexerUtils.regex)('BOOLEAN', /(true|false)/, 'i');
var QUOTEDSTRING = (0, _lexerUtils.map)(parseStringLiteral, (0, _lexerUtils.regex)('BARESTRING', /"([^"]|\")*"/));

var lex = (0, _lexerUtils.Lexer)((0, _lexerUtils.or)(WHITESPACE,

// <key: "val">
// ^
BRA,

// <key: "val">
//            ^
KET,

// <one: 1, two: 2>
//        ^
COMMA,

// <key: "val">
//  ^^^^
(0, _lexerUtils.seq)(KEY, (0, _lexerUtils.optional)(WHITESPACE), KEYVALSEP),

// <Identifier key: "val">
//  ^^^^^^^^^^
(0, _lexerUtils.seq)((0, _lexerUtils.precededByToken)('BRA'), (0, _lexerUtils.optional)(WHITESPACE), (0, _lexerUtils.notFollowedBy)(IDENTIFIER, COMMA)), KEYVALSEP, NUMBER, BOOLEAN, QUOTEDSTRING, BARESTRING));

/*

Grammar:

OPTS = < ARGS > | < IDENT : ARGS >
ARGS = ARG | ARGS , ARG
ARG = KEY : VAL | VAL

*/

// Parses a list of arguments.
function parseArgs(tokenStream) {
  var options = { args: [] };
  var result, nextArg, nextStream;

  while (result = parseArg(tokenStream)) {

    // We want to support two different syntaxes, because the RPG Maker
    // community has ridiculous conventions:
    //
    //     <currency value: 10, name: Gold Stars>
    //
    // In the above, a comma separates key-value pairs. But we also want to
    // support,
    //
    //     <currency value: 10 name: Gold Stars>
    //
    // Where the commas between key value pairs are optional. However, commas
    // are still required between positional args. So this is,
    //
    //     <currency value: 10 name: Gold Stars foo, bar, baz>
    //
    // is not valid, because it's ambiguous -- either of these two
    // interpretatations are reasonable:
    //
    //     { ..., name: "Gold Stars", args: ["foo", "bar", "baz"] }
    //
    //     { ..., name: "Gold Stars foo", args: ["bar", "baz"] }
    //
    // If it weren't for allowing bare strings, everything would be okay. :)
    //
    // So there's a couple of things we have to do. First, we need to modify
    // our bare-string lexer (already done) not to lex multi-word bare strings
    // ending with a key and a colon. This is so that,
    //
    //     <currency name: Gold Stars value: 10>
    //
    // lexes into ..., Token('BARESTRING', 'Gold Stars'), Token('KEY', 'value'), ...
    // instead of ..., Token('BARESTRING', 'Gold Stars value'), Token('KEYVALSEP', ':'), ...
    //
    // Next, if we parse a key-value pair we need to see what token follows it.
    // It may either be
    //
    // 1. A comma, in which case we're done checking. We move onto the next
    //    iteration.
    // 2. A key-value pair, in which case we proceed like above, but we don't
    //    skip over the comma. (Since there isn't one.)
    // 3. A closing ket.
    //
    // All other following tokens are invalid.

    var _result = result;

    var _result2 = _slicedToArray(_result, 2);

    nextArg = _result2[0];
    nextStream = _result2[1];
    if ((typeof nextArg === 'undefined' ? 'undefined' : _typeof(nextArg)) === 'object') {
      options = _extends({}, options, nextArg);

      var isFollowedByComma = nextStream.ofType('COMMA');
      var isFollowedByKeyVal = nextStream.ofType('KEY') && nextStream.advance().ofType('KEYVALSEP');

      if (isFollowedByComma) {
        tokenStream = nextStream.advance();
      } else if (isFollowedByKeyVal) {
        tokenStream = nextStream;
      } else {
        return [options, nextStream];
      }
    } else {
      options = _extends({}, options, { args: options.args.concat(nextArg) });

      if (nextStream.empty || nextStream.get().type != 'COMMA') {
        return [options, nextStream];
      }
      tokenStream = nextStream.advance();
    }
  }

  return [options, tokenStream];
}

// Parses an argument - either a key-value pair or a positional argument.
function parseArg(tokenStream) {
  return parseKeyVal(tokenStream) || parseVal(tokenStream);
}

// Parses a key-value pair.
function parseKeyVal(tokenStream) {
  if (tokenStream.length < 3) {
    return null;
  }

  if (!tokenStream.ofType('KEY') || !tokenStream.advance().ofType('KEYVALSEP')) {
    return null;
  }

  var val = parseVal(tokenStream.advance(2));

  if (!val) {
    return null;
  }

  return [_defineProperty({}, tokenStream.get().token, val[0]), tokenStream.advance(3)];
}

// Parses the value from a key-value pair, or a bare value as a positional
// argument.
function parseVal(tokenStream) {
  if (tokenStream.empty) {
    return null;
  }

  var token = tokenStream.get();

  switch (token.type) {
    case 'NUMBER':
      return [Number(token.token), tokenStream.advance()];
    case 'BARESTRING':
    case 'KEY':
      return [token.token, tokenStream.advance()];
    case 'BOOLEAN':
      return [token.token.toLowerCase() === 'true' ? true : false, tokenStream.advance()];
    default:
      return null;
  }
}

// Parses an "anonymous" object, that is one without a name.
//
// Example:
//
//   <foo: 123, bar: "baz">
function parseAnonymousObject(tokenStream) {
  if (tokenStream.length < 3) {
    return null;
  }

  if (!tokenStream.ofType('BRA')) {
    return null;
  }

  var argsMatch = parseArgs(tokenStream.advance());

  if (!argsMatch) {
    return null;
  }

  var _argsMatch = _slicedToArray(argsMatch, 2);

  var object = _argsMatch[0];
  var ketStream = _argsMatch[1];

  if (!ketStream.ofType('KET')) {
    return null;
  }

  return [object, ketStream.advance()];
}

// Parses a "named" object.
//
// Example:
//
//   <Currency name: "Foo">
function parseNamedObject(tokenStream) {
  if (tokenStream.length < 3) {
    return null;
  }

  var secondTokenStream = tokenStream.advance();

  if (!tokenStream.ofType('BRA') || !secondTokenStream.ofType('IDENTIFIER')) {
    return null;
  }

  var argsMatch = parseArgs(tokenStream.advance(2));

  if (!argsMatch) {
    return null;
  }

  var _argsMatch2 = _slicedToArray(argsMatch, 2);

  var object = _argsMatch2[0];
  var ketStream = _argsMatch2[1];

  if (!ketStream.ofType('KET')) {
    return null;
  }

  return [_extends({}, object, { type: secondTokenStream.get().token }), ketStream.advance()];
}

function parseObject(tokenStream) {
  return parseAnonymousObject(tokenStream) || parseNamedObject(tokenStream);
}

function parseTokenStream(tokenStream) {
  var parsed = parseObject(tokenStream);
  if (parsed) {
    return parsed[0];
  } else {
    return null;
  }
}

function parse(str) {
  return parseTokenStream((0, _lexerUtils.TokenStream)(lex(str)));
}

// Extract all tags contained inside a possibly-unrelated string of text.
function extractAll(str) {
  var tokenStream = (0, _lexerUtils.TokenStream)(lex(str));
  var objects = [];

  while (tokenStream.present) {
    var parsed = parseObject(tokenStream);

    if (parsed) {
      objects.push(parsed[0]);
      tokenStream = parsed[1];
    } else {
      tokenStream = tokenStream.advance();
    }
  }

  return objects;
}

function extractFirstMatching(fn) {
  return function (str) {
    var tokenStream = (0, _lexerUtils.TokenStream)(lex(str));
    var objects = [];

    while (tokenStream.present) {
      var parsed = parseObject(tokenStream);

      if (parsed && fn(parsed[0])) {
        return parsed[0];
      } else {
        tokenStream = tokenStream.advance();
      }
    }

    return null;
  };
}

var extractFirst = exports.extractFirst = extractFirstMatching(function () {
  return true;
});

function extractFirstOfType(str, type) {
  return extractFirstMatching(function (opts) {
    return opts.type === type;
  })(str);
}

function extractAllOfType(str, type) {
  return extractAll(str).filter(function (opts) {
    return opts.type === type;
  });
}

},{"./lexer-utils":23}],23:[function(require,module,exports){
"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CharacterStream = CharacterStream;
exports.TokenStream = TokenStream;
exports.regex = regex;
exports.skip = skip;
exports.optional = optional;
exports.seq = seq;
exports.precededByToken = precededByToken;
exports.map = map;
exports.or = or;
exports.repeat = repeat;
exports.concat = concat;
exports.notFollowedBy = notFollowedBy;
exports.Lexer = Lexer;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// Construct a token.
//
// type - e.g. 'UNDERSCORE'
// token - e.g. '_'
// pos - the (starting) position in the string where it occurred
function _Token(type, token, pos) {
  return { type: type, token: token, pos: pos };
}

// Construct a response returned by a lexer.
//
// tokens - an array of tokens generated by the lexer; may be empty
// newCharacterStream - a new character stream for the next lexer
exports.Token = _Token;
function LexerResponse(tokens, newCharacterStream) {
  return { tokens: tokens, newCharacterStream: newCharacterStream };
}

// A simple "stream" wrapper around an array or string.
//
// Input:
//
//   buffer - the underlying array/string
//   pos - the 'zero' index of the stream
//
// Properties:
//
//   length - the length of the buffer remaining from index pos
//   present - whether the above length is not zero
//   empty - negation of the above
//   rest() - the buffer sliced from pos onward
//   get() - the item in the buffer at pos
//   advance(index = 1) - advance the stream forward by `index` characters;
//                        returns a new Stream
//   take(n) - return the next `n` items in the stream (or as many as are left,
//             whichever is greater)
//
// The calling code can pretend they're just dealing with the slice, but we
// keep track of where we are in the underlying list.

function Stream(buffer) {
  var pos = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return {
    buffer: buffer,
    pos: pos,
    length: buffer.length - pos,
    present: pos < buffer.length,
    empty: pos >= buffer.length,
    rest: function rest() {
      return buffer.slice(pos);
    },
    get: function get() {
      return buffer[pos];
    },
    advance: function advance() {
      var index = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
      return Stream(buffer, pos + index);
    },
    take: function take(n) {
      return buffer.slice(pos, pos + n);
    }
  };
}

function CharacterStream(fullString) {
  var pos = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return _extends({}, Stream(fullString, pos), {
    advance: function advance() {
      var index = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
      return CharacterStream(fullString, pos + index);
    },
    flush: function flush() {
      return CharacterStream(fullString, fullString.length);
    },
    Token: function Token(type, token) {
      return _Token(type, token, pos);
    }
  });
}

function TokenStream(buffer) {
  var pos = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  return _extends({}, Stream(buffer, pos), {
    advance: function advance() {
      var index = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
      return TokenStream(buffer, pos + index);
    },
    ofType: function ofType(type) {
      return pos < buffer.length && buffer[pos].type === type;
    }
  });
}

// Define a tokenizer matching what's left in the stream with a regex. A `^` is
// automatically prepended to the regex, so there is no need to include it
// yourself.
//
// Example:
//
//   const WORD = regex('WORD', /\S+\s*/);
//   Lexer(WORD)('this is a string')
//   // => [
//     Token('WORD',  'this ',    0),
//     Token('WORD',  'is ',      5),
//     Token('WORD',  'a ',       8),
//     Token('WORD',  'string ',  10)
//   ]
//  
function regex(type, regex) {
  var flags = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

  var massagedRegex = new RegExp(/^/.source + regex.source, flags);

  return function (previousTokens, charStream) {
    var match;
    if (match = charStream.rest().match(massagedRegex)) {
      return LexerResponse([charStream.Token(type, match[0])], charStream.advance(match[0].length));
    } else {
      return null;
    }
  };
}

// Like the regex matcher, but throws away the matched token.
function skip(baseMatcher) {
  return function (previousTokens, charStream) {
    var match;
    if (match = baseMatcher(previousTokens, charStream)) {
      return LexerResponse([], match.newCharacterStream);
    } else {
      return null;
    }
  };
}

function optional(matcher) {
  return function (previousTokens, charStream) {
    var match;
    if (match = matcher(previousTokens, charStream)) {
      return LexerResponse([], match.newCharacterStream);
    } else {
      return LexerResponse([], charStream);
    }
  };
}

function seq2(first, second) {
  return function (previousTokens, charStream) {
    var firstMatch = first(previousTokens, charStream);

    if (!firstMatch) {
      return null;
    }

    var secondMatch = second([].concat(_toConsumableArray(previousTokens), _toConsumableArray(firstMatch.tokens)), firstMatch.newCharacterStream);

    if (!secondMatch) {
      return null;
    }

    return LexerResponse([].concat(_toConsumableArray(firstMatch.tokens), _toConsumableArray(secondMatch.tokens)), secondMatch.newCharacterStream);
  };
}

function seq(firstMatcher, secondMatcher, thirdMatcher) {
  var _seq2 = seq2(firstMatcher, secondMatcher);

  if (thirdMatcher) {
    for (var _len = arguments.length, rest = Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      rest[_key - 3] = arguments[_key];
    }

    return seq.apply(undefined, [_seq2, thirdMatcher].concat(rest));
  } else {
    return _seq2;
  }
}

function precededByToken(type) {
  return function (previousTokens, charStream) {
    var lastToken = previousTokens[previousTokens.length - 1];
    if (lastToken && lastToken.type == type) {
      return LexerResponse([], charStream);
    } else {
      return null;
    }
  };
}

function map(fn, matcher) {
  return function (previousTokens, charStream) {
    var match;
    if (match = matcher(previousTokens, charStream)) {
      var mappedTokens = match.tokens.map(function (_ref) {
        var type = _ref.type;
        var token = _ref.token;
        var pos = _ref.pos;
        return _Token(type, fn(token), pos);
      });

      return LexerResponse(mappedTokens, match.newCharacterStream);
    } else {
      return null;
    }
  };
}

function or() {
  for (var _len2 = arguments.length, matchers = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    matchers[_key2] = arguments[_key2];
  }

  return function (previousTokens, charStream) {
    var match;
    for (var i = 0; i < matchers.length; i++) {
      if (match = matchers[i](previousTokens, charStream)) {
        return match;
      }
    }

    return null;
  };
}

function repeat(matcher) {
  return function (previousTokens, charStream) {
    var tokens = [];
    var counter = 0;

    while (charStream.present) {
      var match = matcher(tokens, charStream);

      if (!match) {
        break;
      }

      tokens = [].concat(_toConsumableArray(tokens), _toConsumableArray(match.tokens));

      // Don't get caught in an infinite loop.
      if (match.newCharacterStream.pos === charStream.pos) {
        return LexerResponse(tokens, match.newCharacterStream);
      }

      if (counter++ > 10000) {
        throw "tried to lex more than 10,000 tokens - this is probably a bug.";
      }

      charStream = match.newCharacterStream;
    }

    return LexerResponse(tokens, charStream);
  };
}

// Concatenates the (string) tokens returned by a matcher into a single string.
function concat(type, matcher) {
  return function (previousTokens, charStream) {
    var match = matcher(previousTokens, charStream);

    if (match) {
      var joinedToken = match.tokens.map(function (t) {
        return t.token;
      }).join("");
      return LexerResponse([charStream.Token(type, joinedToken)], match.newCharacterStream);
    } else {
      return null;
    }
  };
}

function notFollowedBy(mustMatch, mustNotMatch) {
  return function (previousTokens, charStream) {
    var match = mustMatch(previousTokens, charStream);

    if (!match) {
      return null;
    }

    var nextMatch = mustNotMatch([].concat(_toConsumableArray(previousTokens), _toConsumableArray(match.tokens)), match.newCharacterStream);

    if (!nextMatch) {
      return match;
    } else {
      return null;
    }
  };
}

function Lexer(_lexer) {
  return function (str) {
    var charStream = CharacterStream(str);
    var matcher = repeat(or(_lexer, regex('UNKNOWN', /[^]*/)));

    return matcher([], charStream).tokens;
  };
}

},{}],24:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FixOSXCopyPaste = FixOSXCopyPaste;
exports.MoveDevToolsWindow = MoveDevToolsWindow;
exports.InstallAllFixes = InstallAllFixes;

var _nw = require('nw.gui');

var _nw2 = _interopRequireDefault(_nw);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _gameObserver = require('./game-observer');

var _gameObserver2 = _interopRequireDefault(_gameObserver);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!Utils.isNwjs()) {
  throw "rmmv-mrp-core/osx-fixes can only be run during development";
}

// Are we inside nw.js, and are we running OSX?
var isOSX = _os2.default && _os2.default.platform() === "darwin";

function FixOSXCopyPaste() {
  if (isOSX) {
    var win = _nw2.default.Window.get();
    var nativeMenuBar = new _nw2.default.Menu({ type: "menubar" });
    nativeMenuBar.createMacBuiltin("Game");
    win.menu = nativeMenuBar;
  }
}

function _moveDevToolsWindow() {
  if (isOSX) {
    var dev = _nw2.default.Window.get().showDevTools();
    dev.x = 50;
    dev.y = 50;
  }
}

function MoveDevToolsWindow() {
  if (isOSX) {
    var win = _nw2.default.Window.get();

    // YanFly's plugin sets the devtools position to 0,0 when the game starts.
    // So here we do it afterwards.
    _gameObserver2.default.on('game.start.after', function () {
      // If the devtools are already opened, move them immediately.
      if (win.isDevToolsOpen()) {
        _moveDevToolsWindow();
      }

      // Otherwise, move the window when the user opens it.
      win.once('devtools-opened', _moveDevToolsWindow);
    });
  }
}

function InstallAllFixes() {
  if (isOSX) {
    FixOSXCopyPaste();
    MoveDevToolsWindow();
  }
}

},{"./game-observer":18,"nw.gui":undefined,"os":undefined}]},{},[16]);
