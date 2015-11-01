import {
  regex, skip, optional, map, precededByToken, seq, or, Lexer, TokenStream
} from './LexerUtils';

const BRA          = regex('BRA', /</);
const KET          = regex('KET', />/);
const WHITESPACE   = skip(regex('WHITESPACE', /^\s+/));
const IDENTIFIER   = regex('IDENTIFIER', /[a-zA-Z_][a-zA-Z0-9-_]*/);
const KEY          = regex('KEY', /[a-zA-Z_][a-zA-Z0-9-_]*/);
const KEYVALSEP    = regex('KEYVALSEP', /:/);
const BARESTRING   = regex('BARESTRING', /[^,:><"]+/);
const COMMA        = regex('COMMA', /,/);
const NUMBER       = regex('NUMBER', /-?[0-9]+(\.[0-9]+)?/);
const BOOLEAN      = regex('BOOLEAN', /(true|false)/, 'i');
const QUOTEDSTRING = map(JSON.parse, regex('BARESTRING', /"([^"]|\\")*"/));

const lex = Lexer(or(
  WHITESPACE,

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
  seq(KEY, optional(WHITESPACE), KEYVALSEP),

  // <Identifier key: "val">
  //  ^^^^^^^^^^
  seq(
    precededByToken('BRA'), optional(WHITESPACE), IDENTIFIER
  ),

  KEYVALSEP,
  NUMBER,
  BOOLEAN,

  QUOTEDSTRING,
  BARESTRING
));

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
    [nextArg, nextStream] = result;

    if (typeof nextArg === 'object') {
      options = { ...options, ...nextArg };
    } else {
      options = { ...options, args: options.args.concat(nextArg) };
    }

    if (nextStream.empty || nextStream.get().type != 'COMMA') {
      return [options, nextStream];
    }

    tokenStream = nextStream.advance();
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

  const val = parseVal(tokenStream.advance(2));

  if (!val) {
    return null;
  }

  return [{ [tokenStream.get().token]: val[0] }, tokenStream.advance(3)];
}

// Parses the value from a key-value pair, or a bare value as a positional
// argument.
function parseVal(tokenStream) {
  if (tokenStream.empty) {
    return null;
  }

  var token = tokenStream.get();

  switch(token.type) {
    case 'NUMBER':     return [Number(token.token), tokenStream.advance()];
    case 'BARESTRING':
    case 'KEY':        return [token.token, tokenStream.advance()];
    case 'BOOLEAN':    return [token.token.toLowerCase() === 'true' ? true : false, tokenStream.advance()];
    default:           return null;
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

  const argsMatch = parseArgs(tokenStream.advance());

  if (!argsMatch) {
    return null;
  }

  const [object, ketStream] = argsMatch;

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

  const secondTokenStream = tokenStream.advance();

  if (!tokenStream.ofType('BRA') || !secondTokenStream.ofType('IDENTIFIER')) {
    return null;
  }

  const argsMatch = parseArgs(tokenStream.advance(2));

  if (!argsMatch) {
    return null;
  }

  const [object, ketStream] = argsMatch;

  if (!ketStream.ofType('KET')) {
    return null;
  }

  return [{ ...object, type: secondTokenStream.get().token }, ketStream.advance()];
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

export function parse(str) {
  return parseTokenStream(TokenStream(lex(str)));
}

// Extract all tags contained inside a possibly-unrelated string of text.
export function extractAll(str) {
  var tokenStream = TokenStream(lex(str));
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
  return function(str) {
    var tokenStream = TokenStream(lex(str));
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
  }
}

export const extractFirst = extractFirstMatching(() => true);

export function extractFirstOfType(str, type) {
  return extractFirstMatching((opts) => opts.type === type)(str);
}

export function extractAllOfType(str, type) {
  return extractAll(str).filter((opts) => opts.type === type);
}
