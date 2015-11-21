(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _optionParser = require('./module/option-parser');

var OptionParser = _interopRequireWildcard(_optionParser);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

if (!window.MRP) {
  window.MRP = {};
} //=============================================================================
// RPG Maker MV MRP Option Parser
// rmmv-mrp-core--option-parser.js
// Version: 0.0.14
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

window.MRP.OptionParser = OptionParser;

},{"./module/option-parser":2}],2:[function(require,module,exports){
'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.extractFirst = exports._tokenize = undefined;
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
var SLASH = (0, _lexerUtils.regex)('SLASH', /\//);

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
var QUOTEDSTRING = (0, _lexerUtils.regex)('QUOTEDSTRING', /"(\\.|[^"\\])*"/);

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
(0, _lexerUtils.seq)((0, _lexerUtils.precededByToken)('BRA'), (0, _lexerUtils.optional)(WHITESPACE), (0, _lexerUtils.notFollowedBy)(IDENTIFIER, COMMA)),

// </Identifier>
//  ^^^^^^^^^^^^
(0, _lexerUtils.seq)((0, _lexerUtils.precededByToken)('BRA'), SLASH, (0, _lexerUtils.optional)(WHITESPACE), IDENTIFIER, (0, _lexerUtils.optional)(WHITESPACE), KET), KEYVALSEP, NUMBER, BOOLEAN, QUOTEDSTRING, BARESTRING));

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
function parseVal(stream) {
  if (stream.empty) {
    return null;
  }

  var _stream$get = stream.get();

  var token = _stream$get.token;
  var type = _stream$get.type;

  switch (type) {
    case 'NUMBER':
      return [Number(token), stream.advance()];
    case 'QUOTEDSTRING':
      return [parseStringLiteral(token), stream.advance()];
    case 'BARESTRING':
    case 'KEY':
      return [token, stream.advance()];
    case 'BOOLEAN':
      return [token.toLowerCase() === 'true' ? true : false, stream.advance()];
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

  // e.g. Currency
  var type = secondTokenStream.get().token;

  // At this point, we have a valid object. But we might also have a block of
  // text to parse after it.
  var endTagStream = findSequence(function (stream) {
    return streamAtSequence(['BRA', 'SLASH', 'IDENTIFIER', 'KET'], stream) && stream.advance(2).get().token === type;
  }, ketStream.advance());

  if (endTagStream) {
    var fullString = ketStream.get().string;
    var blockString = fullString.slice(ketStream.get().pos + 1, endTagStream.get().pos);

    return [_extends({}, object, { type: type, block: chompLinebreaks(blockString) }), endTagStream.advance(4)];
  } else {
    return [_extends({}, object, { type: type }), ketStream.advance()];
  }
}

var chompLinebreaks = function chompLinebreaks(str) {
  return str.replace(/^\n/, '').replace(/\n$/, '');
};

// true if the stream is pointing at the given sequence of token names
function streamAtSequence(tokenNames, stream) {
  for (var i = 0; i < tokenNames.length; i++) {
    if (!stream.advance(i).ofType(tokenNames[i])) {
      return false;
    }
  }

  return true;
}

// Looks for a sequence of tokens somewhere ahead in the stream.
//
// If present, returns the stream starting at the match.
//
// Otherwise returns null.
function findSequence(fn, stream) {
  while (stream.present) {
    if (fn(stream)) {
      return stream;
    }

    stream = stream.advance();
  }

  return null;
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

var _tokenize = exports._tokenize = function _tokenize(str) {
  return (0, _lexerUtils.TokenStream)(lex(str));
};

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

},{"./lexer-utils":3}],3:[function(require,module,exports){
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
// string - the full string being tokenized
function _Token(type, token, pos, string) {
  return { type: type, token: token, pos: pos, string: string };
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
      return _Token(type, token, pos, fullString);
    }
  });
}

function TokenStream(buffer) {
  var pos = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

  var string = buffer.length > 0 ? buffer[0].string : "";

  return _extends({}, Stream(buffer, pos), {

    // advance to the next token
    advance: function advance() {
      var index = arguments.length <= 0 || arguments[0] === undefined ? 1 : arguments[0];
      return TokenStream(buffer, pos + index);
    },

    // is the cursor at a token of type `type`?
    ofType: function ofType(type) {
      return pos < buffer.length && buffer[pos].type === type;
    },

    // the original string being parsed
    string: string
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
        var string = _ref.string;
        return _Token(type, fn(token), pos, string);
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

},{}]},{},[1]);
