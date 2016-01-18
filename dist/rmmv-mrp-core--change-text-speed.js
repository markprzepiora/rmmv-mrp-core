(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _changeTextSpeed = require('./module/change-text-speed');

var _changeTextSpeed2 = _interopRequireDefault(_changeTextSpeed);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_changeTextSpeed2.default.install(); //=============================================================================
// RPG Maker MV MRP Change Text Speed
// rmmv-mrp-core--change-text-speed.js
// Version: 0.0.14
//=============================================================================

//=============================================================================
/*:
 * @plugindesc Change message text speed on a per-message basis.
 * @author Mark Przepiora
 *
 * @help
 * ============================================================================
 * Instructions
 * ============================================================================
 *
 * Please look on GitHub for complete instructions:
 * https://github.com/markprzepiora/rmmv-mrp-core/blob/master/docs/ChangeTextSpeed.md
 */
//=============================================================================

},{"./module/change-text-speed":2}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.install = install;
function install() {
  var _processCharacter = Window_Base.prototype.processCharacter;
  Window_Base.prototype.processCharacter = function (textState) {
    if (typeof textState.slowdown === 'undefined') {
      return _processCharacter.apply(this, arguments);
    }

    if (typeof textState.slowdownCounter === 'undefined') {
      textState.slowdownCounter = 0;
    }

    if (textState.slowdownCounter++ >= textState.slowdown) {
      textState.slowdownCounter = 0;
      return _processCharacter.apply(this, arguments);
    }
  };

  var _processEscapeCharacter = Window_Message.prototype.processEscapeCharacter;
  Window_Message.prototype.processEscapeCharacter = function (code, textState) {
    if (code === 'S') {
      var slowdown = Number(this.obtainEscapeParam(textState));
      textState.slowdown = slowdown ? slowdown : null;
    } else {
      _processEscapeCharacter.apply(this, arguments);
    }
  };
}

},{}]},{},[1]);
