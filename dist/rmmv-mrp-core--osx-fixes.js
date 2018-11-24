//=============================================================================
// RPG Maker MV MRP Core - Fix Copy/Paste and stuck Dev Tools window on OSX
// rmmv-mrp-core--osx-fixes.js
// Version: 0.0.18
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

!function(t){var n={};function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r})},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(r,o,function(n){return t[n]}.bind(null,o));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=32)}([,function(t,n,e){"use strict";e.r(n),e.d(n,"events",function(){return i}),e.d(n,"event",function(){return u}),e.d(n,"info",function(){return c});var r=e(6),o=e.n(r);function i(t=(()=>!0)){return $gameMap.events().map(t=>a(t.eventId())).filter(t)}function u(t){return"number"==typeof t?a(t):function(t){const n=o()(n=>n&&n.name===t,$dataMap.events);if(n<0)throw`could not find event with name ${t}`;return a(n)}(t)}function c(){return $dataMapInfos[$gameMap.mapId()]}function a(t){const n=$dataMap.events[t],e=$gameMap._events[t];if(!n)throw`could not find event definition with id ${t}`;if(!e)throw`could not find event instance with id ${t}`;return{definition:n,instance:e,id:t}}},function(t,n,e){"use strict";var r=e(5),o=e.n(r),i=e(1);const u=o()({});function c(t,n,e){const r=t.prototype[n];t.prototype[n]=function(){return e(r.bind(this),...arguments)}}function a(t,n,e){const r=t[n];t[n]=function(){return e(r.bind(t),...arguments)}}function f(t,n,e,r){t(n,e,function(t,...n){u.emit(r+".before"),t(...n),u.emit(r+".after"),u.emit(r)})}function s(t,n,e){f(c,t,n,e)}function l(t,n,e){f(a,t,n,e)}s(Game_Troop,"onBattleStart","battle.start"),s(Game_Troop,"onBattleEnd","battle.end"),s(Game_Map,"setup","map.setup"),l(BattleManager,"endTurn","turn.end"),l(BattleManager,"startTurn","turn.start"),l(BattleManager,"startAction","battleAction.start"),l(BattleManager,"endAction","battleAction.end"),l(SceneManager,"run","game.start"),s(Game_Player,"executeMove","player.move"),u.onMap=function(t,n){return u.on("map.setup",function(){i.info().id!==t&&i.info().name!==t||n()}),function(){u.off(observer)}},u.onRegion=function(t,n){return u.on("player.move",function(){$gamePlayer.regionId()===t&&n()}),function(){u.off(observer)}},n.a=u},function(t,n,e){"use strict";var r=e(14)();t.exports=function(t){return t!==r&&null!==t}},function(t,n,e){var r=e(22);t.exports=function(t){return function n(e,o){var i=arguments.length;return 0===i?n:1===i&&null!=e&&!0===e["@@functional/placeholder"]?n:1===i?r(function(n){return t(e,n)}):2===i&&null!=e&&!0===e["@@functional/placeholder"]&&null!=o&&!0===o["@@functional/placeholder"]?n:2===i&&null!=e&&!0===e["@@functional/placeholder"]?r(function(n){return t(n,o)}):2===i&&null!=o&&!0===o["@@functional/placeholder"]?r(function(n){return t(e,n)}):t(e,o)}}},function(t,n,e){"use strict";var r,o,i,u,c,a,f,s=e(7),l=e(21),p=Function.prototype.apply,d=Function.prototype.call,h=Object.create,v=Object.defineProperty,y=Object.defineProperties,b=Object.prototype.hasOwnProperty,g={configurable:!0,enumerable:!1,writable:!0};o=function(t,n){var e,o;return l(n),o=this,r.call(this,t,e=function(){i.call(o,t,e),p.call(n,this,arguments)}),e.__eeOnceListener__=n,this},c={on:r=function(t,n){var e;return l(n),b.call(this,"__ee__")?e=this.__ee__:(e=g.value=h(null),v(this,"__ee__",g),g.value=null),e[t]?"object"==typeof e[t]?e[t].push(n):e[t]=[e[t],n]:e[t]=n,this},once:o,off:i=function(t,n){var e,r,o,i;if(l(n),!b.call(this,"__ee__"))return this;if(!(e=this.__ee__)[t])return this;if("object"==typeof(r=e[t]))for(i=0;o=r[i];++i)o!==n&&o.__eeOnceListener__!==n||(2===r.length?e[t]=r[i?0:1]:r.splice(i,1));else r!==n&&r.__eeOnceListener__!==n||delete e[t];return this},emit:u=function(t){var n,e,r,o,i;if(b.call(this,"__ee__")&&(o=this.__ee__[t]))if("object"==typeof o){for(e=arguments.length,i=new Array(e-1),n=1;n<e;++n)i[n-1]=arguments[n];for(o=o.slice(),n=0;r=o[n];++n)p.call(r,this,i)}else switch(arguments.length){case 1:d.call(o,this);break;case 2:d.call(o,this,arguments[1]);break;case 3:d.call(o,this,arguments[1],arguments[2]);break;default:for(e=arguments.length,i=new Array(e-1),n=1;n<e;++n)i[n-1]=arguments[n];p.call(o,this,i)}}},a={on:s(r),once:s(o),off:s(i),emit:s(u)},f=y({},a),t.exports=n=function(t){return null==t?h(f):y(Object(t),a)},n.methods=c},function(t,n,e){var r=e(4),o=e(23),i=e(27);t.exports=r(o("findIndex",i,function(t,n){for(var e=0,r=n.length;e<r;){if(t(n[e]))return e;e+=1}return-1}))},function(t,n,e){"use strict";var r=e(8),o=e(16),i=e(17),u=e(18);(t.exports=function(t,n){var e,i,c,a,f;return arguments.length<2||"string"!=typeof t?(a=n,n=t,t=null):a=arguments[2],null==t?(e=c=!0,i=!1):(e=u.call(t,"c"),i=u.call(t,"e"),c=u.call(t,"w")),f={value:n,configurable:e,enumerable:i,writable:c},a?r(o(a),f):f}).gs=function(t,n,e){var c,a,f,s;return"string"!=typeof t?(f=e,e=n,n=t,t=null):f=arguments[3],null==n?n=void 0:i(n)?null==e?e=void 0:i(e)||(f=e,e=void 0):(f=n,n=e=void 0),null==t?(c=!0,a=!1):(c=u.call(t,"c"),a=u.call(t,"e")),s={get:n,set:e,configurable:c,enumerable:a},f?r(o(f),s):s}},function(t,n,e){"use strict";t.exports=e(9)()?Object.assign:e(10)},function(t,n,e){"use strict";t.exports=function(){var t,n=Object.assign;return"function"==typeof n&&(n(t={foo:"raz"},{bar:"dwa"},{trzy:"trzy"}),t.foo+t.bar+t.trzy==="razdwatrzy")}},function(t,n,e){"use strict";var r=e(11),o=e(15),i=Math.max;t.exports=function(t,n){var e,u,c,a=i(arguments.length,2);for(t=Object(o(t)),c=function(r){try{t[r]=n[r]}catch(t){e||(e=t)}},u=1;u<a;++u)n=arguments[u],r(n).forEach(c);if(void 0!==e)throw e;return t}},function(t,n,e){"use strict";t.exports=e(12)()?Object.keys:e(13)},function(t,n,e){"use strict";t.exports=function(){try{return Object.keys("primitive"),!0}catch(t){return!1}}},function(t,n,e){"use strict";var r=e(3),o=Object.keys;t.exports=function(t){return o(r(t)?Object(t):t)}},function(t,n,e){"use strict";t.exports=function(){}},function(t,n,e){"use strict";var r=e(3);t.exports=function(t){if(!r(t))throw new TypeError("Cannot use null or undefined");return t}},function(t,n,e){"use strict";var r=e(3),o=Array.prototype.forEach,i=Object.create;t.exports=function(t){var n=i(null);return o.call(arguments,function(t){r(t)&&function(t,n){var e;for(e in t)n[e]=t[e]}(Object(t),n)}),n}},function(t,n,e){"use strict";t.exports=function(t){return"function"==typeof t}},function(t,n,e){"use strict";t.exports=e(19)()?String.prototype.contains:e(20)},function(t,n,e){"use strict";var r="razdwatrzy";t.exports=function(){return"function"==typeof r.contains&&(!0===r.contains("dwa")&&!1===r.contains("foo"))}},function(t,n,e){"use strict";var r=String.prototype.indexOf;t.exports=function(t){return r.call(this,t,arguments[1])>-1}},function(t,n,e){"use strict";t.exports=function(t){if("function"!=typeof t)throw new TypeError(t+" is not a function");return t}},function(t,n){t.exports=function(t){return function n(e){return 0===arguments.length?n:null!=e&&!0===e["@@functional/placeholder"]?n:t.apply(this,arguments)}}},function(t,n,e){var r=e(24),o=e(25),i=e(26);t.exports=function(t,n,e){return function(){var u=arguments.length;if(0===u)return e();var c=arguments[u-1];if(!r(c)){var a=i(arguments,0,u-1);if("function"==typeof c[t])return c[t].apply(c,a);if(o(c))return n.apply(null,a)(c)}return e.apply(this,arguments)}}},function(t,n){t.exports=Array.isArray||function(t){return null!=t&&t.length>=0&&"[object Array]"===Object.prototype.toString.call(t)}},function(t,n){t.exports=function(t){return"function"==typeof t["@@transducer/step"]}},function(t,n){t.exports=function t(n,e,r){switch(arguments.length){case 1:return t(n,0,n.length);case 2:return t(n,e,n.length);default:for(var o=[],i=0,u=Math.max(0,Math.min(n.length,r)-e);i<u;)o[i]=n[e+i],i+=1;return o}}},function(t,n,e){var r=e(4),o=e(28),i=e(29);t.exports=function(){function t(t,n){this.xf=n,this.f=t,this.idx=-1,this.found=!1}return t.prototype["@@transducer/init"]=i.init,t.prototype["@@transducer/result"]=function(t){return this.found||(t=this.xf["@@transducer/step"](t,-1)),this.xf["@@transducer/result"](t)},t.prototype["@@transducer/step"]=function(t,n){return this.idx+=1,this.f(n)&&(this.found=!0,t=o(this.xf["@@transducer/step"](t,this.idx))),t},r(function(n,e){return new t(n,e)})}()},function(t,n){t.exports=function(t){return t&&t["@@transducer/reduced"]?t:{"@@transducer/value":t,"@@transducer/reduced":!0}}},function(t,n){t.exports={init:function(){return this.xf["@@transducer/init"]()},result:function(t){return this.xf["@@transducer/result"](t)}}},,,function(t,n,e){"use strict";e.r(n);var r={};e.r(r),e.d(r,"FixOSXCopyPaste",function(){return a}),e.d(r,"MoveDevToolsWindow",function(){return s}),e.d(r,"install",function(){return l});var o=e(2);if(!Utils.isNwjs())throw"rmmv-mrp-core/osx-fixes can only be run during development";const i=window.require("nw.gui"),u=window.require("os"),c=u&&"darwin"===u.platform();function a(){if(c){var t=i.Window.get(),n=new i.Menu({type:"menubar"});n.createMacBuiltin("Game"),t.menu=n}}function f(){if(c){const t=i.Window.get().showDevTools();t.x=50,t.y=50}}function s(){if(c){var t=i.Window.get();o.a.on("game.start.after",function(){t.isDevToolsOpen()&&f(),t.once("devtools-opened",f)})}}function l(){c&&(a(),s())}window.MRP||(window.MRP={}),l(),window.MRP.OSXFixes=r}]);