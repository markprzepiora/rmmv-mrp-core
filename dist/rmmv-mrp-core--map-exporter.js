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
var _curry2 = require('./internal/_curry2');
var _dispatchable = require('./internal/_dispatchable');
var _xfindIndex = require('./internal/_xfindIndex');


/**
 * Returns the index of the first element of the list which matches the predicate, or `-1`
 * if no element matches.
 *
 * Dispatches to the `findIndex` method of the second argument, if present.
 *
 * Acts as a transducer if a transformer is given in list position.
 * @see R.transduce
 *
 * @func
 * @memberOf R
 * @since v0.1.1
 * @category List
 * @sig (a -> Boolean) -> [a] -> Number
 * @param {Function} fn The predicate function used to determine if the element is the
 * desired one.
 * @param {Array} list The array to consider.
 * @return {Number} The index of the element found, or `-1`.
 * @example
 *
 *      var xs = [{a: 1}, {a: 2}, {a: 3}];
 *      R.findIndex(R.propEq('a', 2))(xs); //=> 1
 *      R.findIndex(R.propEq('a', 4))(xs); //=> -1
 */
module.exports = _curry2(_dispatchable('findIndex', _xfindIndex, function findIndex(fn, list) {
  var idx = 0;
  var len = list.length;
  while (idx < len) {
    if (fn(list[idx])) {
      return idx;
    }
    idx += 1;
  }
  return -1;
}));

},{"./internal/_curry2":18,"./internal/_dispatchable":19,"./internal/_xfindIndex":25}],17:[function(require,module,exports){
/**
 * Optimized internal one-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
module.exports = function _curry1(fn) {
  return function f1(a) {
    if (arguments.length === 0) {
      return f1;
    } else if (a != null && a['@@functional/placeholder'] === true) {
      return f1;
    } else {
      return fn.apply(this, arguments);
    }
  };
};

},{}],18:[function(require,module,exports){
var _curry1 = require('./_curry1');


/**
 * Optimized internal two-arity curry function.
 *
 * @private
 * @category Function
 * @param {Function} fn The function to curry.
 * @return {Function} The curried function.
 */
module.exports = function _curry2(fn) {
  return function f2(a, b) {
    var n = arguments.length;
    if (n === 0) {
      return f2;
    } else if (n === 1 && a != null && a['@@functional/placeholder'] === true) {
      return f2;
    } else if (n === 1) {
      return _curry1(function(b) { return fn(a, b); });
    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true &&
                          b != null && b['@@functional/placeholder'] === true) {
      return f2;
    } else if (n === 2 && a != null && a['@@functional/placeholder'] === true) {
      return _curry1(function(a) { return fn(a, b); });
    } else if (n === 2 && b != null && b['@@functional/placeholder'] === true) {
      return _curry1(function(b) { return fn(a, b); });
    } else {
      return fn(a, b);
    }
  };
};

},{"./_curry1":17}],19:[function(require,module,exports){
var _isArray = require('./_isArray');
var _isTransformer = require('./_isTransformer');
var _slice = require('./_slice');


/**
 * Returns a function that dispatches with different strategies based on the
 * object in list position (last argument). If it is an array, executes [fn].
 * Otherwise, if it has a  function with [methodname], it will execute that
 * function (functor case). Otherwise, if it is a transformer, uses transducer
 * [xf] to return a new transformer (transducer case). Otherwise, it will
 * default to executing [fn].
 *
 * @private
 * @param {String} methodname property to check for a custom implementation
 * @param {Function} xf transducer to initialize if object is transformer
 * @param {Function} fn default ramda implementation
 * @return {Function} A function that dispatches on object in list position
 */
module.exports = function _dispatchable(methodname, xf, fn) {
  return function() {
    var length = arguments.length;
    if (length === 0) {
      return fn();
    }
    var obj = arguments[length - 1];
    if (!_isArray(obj)) {
      var args = _slice(arguments, 0, length - 1);
      if (typeof obj[methodname] === 'function') {
        return obj[methodname].apply(obj, args);
      }
      if (_isTransformer(obj)) {
        var transducer = xf.apply(null, args);
        return transducer(obj);
      }
    }
    return fn.apply(this, arguments);
  };
};

},{"./_isArray":20,"./_isTransformer":21,"./_slice":23}],20:[function(require,module,exports){
/**
 * Tests whether or not an object is an array.
 *
 * @private
 * @param {*} val The object to test.
 * @return {Boolean} `true` if `val` is an array, `false` otherwise.
 * @example
 *
 *      _isArray([]); //=> true
 *      _isArray(null); //=> false
 *      _isArray({}); //=> false
 */
module.exports = Array.isArray || function _isArray(val) {
  return (val != null &&
          val.length >= 0 &&
          Object.prototype.toString.call(val) === '[object Array]');
};

},{}],21:[function(require,module,exports){
module.exports = function _isTransformer(obj) {
  return typeof obj['@@transducer/step'] === 'function';
};

},{}],22:[function(require,module,exports){
module.exports = function _reduced(x) {
  return x && x['@@transducer/reduced'] ? x :
    {
      '@@transducer/value': x,
      '@@transducer/reduced': true
    };
};

},{}],23:[function(require,module,exports){
/**
 * An optimized, private array `slice` implementation.
 *
 * @private
 * @param {Arguments|Array} args The array or arguments object to consider.
 * @param {Number} [from=0] The array index to slice from, inclusive.
 * @param {Number} [to=args.length] The array index to slice to, exclusive.
 * @return {Array} A new, sliced array.
 * @example
 *
 *      _slice([1, 2, 3, 4, 5], 1, 3); //=> [2, 3]
 *
 *      var firstThreeArgs = function(a, b, c, d) {
 *        return _slice(arguments, 0, 3);
 *      };
 *      firstThreeArgs(1, 2, 3, 4); //=> [1, 2, 3]
 */
module.exports = function _slice(args, from, to) {
  switch (arguments.length) {
    case 1: return _slice(args, 0, args.length);
    case 2: return _slice(args, from, args.length);
    default:
      var list = [];
      var idx = 0;
      var len = Math.max(0, Math.min(args.length, to) - from);
      while (idx < len) {
        list[idx] = args[from + idx];
        idx += 1;
      }
      return list;
  }
};

},{}],24:[function(require,module,exports){
module.exports = {
  init: function() {
    return this.xf['@@transducer/init']();
  },
  result: function(result) {
    return this.xf['@@transducer/result'](result);
  }
};

},{}],25:[function(require,module,exports){
var _curry2 = require('./_curry2');
var _reduced = require('./_reduced');
var _xfBase = require('./_xfBase');


module.exports = (function() {
  function XFindIndex(f, xf) {
    this.xf = xf;
    this.f = f;
    this.idx = -1;
    this.found = false;
  }
  XFindIndex.prototype['@@transducer/init'] = _xfBase.init;
  XFindIndex.prototype['@@transducer/result'] = function(result) {
    if (!this.found) {
      result = this.xf['@@transducer/step'](result, -1);
    }
    return this.xf['@@transducer/result'](result);
  };
  XFindIndex.prototype['@@transducer/step'] = function(result, input) {
    this.idx += 1;
    if (this.f(input)) {
      this.found = true;
      result = _reduced(this.xf['@@transducer/step'](result, this.idx));
    }
    return result;
  };

  return _curry2(function _xfindIndex(f, xf) { return new XFindIndex(f, xf); });
})();

},{"./_curry2":18,"./_reduced":22,"./_xfBase":24}],26:[function(require,module,exports){
'use strict';

var _mapExporter = require('./module/map-exporter');

var _mapExporter2 = _interopRequireDefault(_mapExporter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

if (!window.MRP) {
  window.MRP = {};
} //=============================================================================
// RPG Maker MV MRP Map Exporter
// rmmv-mrp-core--map-exporter.js
// Version: 0.0.16
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
 * https://github.com/markprzepiora/rmmv-mrp-core/blob/master/docs/MapExporter.md
 */
//=============================================================================

window.MRP.MapExporter = _mapExporter2.default;

},{"./module/map-exporter":30}],27:[function(require,module,exports){
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

},{"nw.gui":undefined,"os":undefined,"path":undefined}],28:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventEmitter = require('event-emitter');

var _eventEmitter2 = _interopRequireDefault(_eventEmitter);

var _map = require('./map');

var Map = _interopRequireWildcard(_map);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
eventizeSingletonMethod(BattleManager, 'startAction', 'battleAction.start');
eventizeSingletonMethod(BattleManager, 'endAction', 'battleAction.end');
eventizeSingletonMethod(SceneManager, 'run', 'game.start');
eventizePrototypeMethod(Game_Player, 'executeMove', 'player.move');

GameObserver.onMap = function onMap(mapNameOrID, callback) {
  function off() {
    GameObserver.off(observer);
  }

  GameObserver.on('map.setup', function observer() {
    if (Map.info().id === mapNameOrID || Map.info().name === mapNameOrID) {
      callback();
    }
  });

  return off;
};

GameObserver.onRegion = function onRegion(regionID, callback) {
  function off() {
    GameObserver.off(observer);
  }

  GameObserver.on('player.move', function observer() {
    if ($gamePlayer.regionId() === regionID) {
      callback();
    }
  });

  return off;
};

exports.default = GameObserver;

},{"./map":31,"event-emitter":1}],29:[function(require,module,exports){
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

},{"./game-observer":28}],30:[function(require,module,exports){
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

},{"./directories":27,"./geometry":29,"fs":undefined,"nw.gui":undefined,"path":undefined}],31:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.events = events;
exports.event = event;
exports.info = info;

var _findIndex = require('ramda/src/findIndex');

var _findIndex2 = _interopRequireDefault(_findIndex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function events() {
  var fn = arguments.length <= 0 || arguments[0] === undefined ? function () {
    return true;
  } : arguments[0];

  return $gameMap.events().map(function (e) {
    return Event(e.eventId());
  }).filter(fn);
}

function event(idOrName) {
  if (typeof idOrName === 'number') {
    return Event(idOrName);
  } else {
    return findEventByName(idOrName);
  }
}

function info() {
  return $dataMapInfos[$gameMap.mapId()];
}

function Event(id) {
  var definition = $dataMap.events[id];
  var instance = $gameMap._events[id];

  if (!definition) {
    throw 'could not find event definition with id ' + id;
  }

  if (!instance) {
    throw 'could not find event instance with id ' + id;
  }

  return { definition: definition, instance: instance, id: id };
}

function findEventByName(name) {
  var id = (0, _findIndex2.default)(function (e) {
    return e && e.name === name;
  }, $dataMap.events);

  if (id < 0) {
    throw 'could not find event with name ' + name;
  }

  return Event(id);
}

},{"ramda/src/findIndex":16}]},{},[26]);
