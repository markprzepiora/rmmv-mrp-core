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

var _osxFixes = require('./module/osx-fixes');

var OSXFixes = _interopRequireWildcard(_osxFixes);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

if (!window.MRP) {
  window.MRP = {};
} //=============================================================================
// RPG Maker MV MRP Core - Fix Copy/Paste and stuck Dev Tools window on OSX
// rmmv-mrp-core--osx-fixes.js
// Version: 0.0.12
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

OSXFixes.InstallAllFixes();

window.MRP.OSXFixes = OSXFixes;

},{"./module/osx-fixes":18}],17:[function(require,module,exports){
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

},{"event-emitter":1}],18:[function(require,module,exports){
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

},{"./game-observer":17,"nw.gui":undefined,"os":undefined}]},{},[16]);
