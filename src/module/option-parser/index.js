import {
  regex, skip, optional, map, precededByToken, seq, or, repeat, concat, notFollowedBy,
  Lexer, TokenStream
} from './lexer-utils';

const BRA          = regex('BRA', /</);
const KET          = regex('KET', />/);
const WHITESPACE   = skip(regex('WHITESPACE', /\s+/));
const IDENTIFIER   = regex('IDENTIFIER', /[a-zA-Z_][a-zA-Z0-9-_]*/);
const KEY          = regex('KEY', /[a-zA-Z_][a-zA-Z0-9-_]*/);
const KEYVALSEP    = regex('KEYVALSEP', /:/);
const KEYVAL       = seq(KEY, optional(WHITESPACE), KEYVALSEP);

// Bare strings are complicated because we need to allow commas between key
// value pairs to be optional. So in the following string,
//
//     foo bar baz: 10
//
// we want to match 'foo bar', not 'foo bar baz'

const SIGNIFICANT_WHITESPACE = regex('SIGNIFICANT_WHITESPACE', /\s+/);
const BAREWORD = regex('BAREWORD', /[^,:><"\s]+/);

const BARESTRING = concat('BARESTRING', seq(
  BAREWORD,
  repeat(
    notFollowedBy(
      seq(
        SIGNIFICANT_WHITESPACE,
        BAREWORD
      ), seq(
        optional(WHITESPACE),
        KEYVALSEP
      )
    )
  )
));

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
    precededByToken('BRA'), optional(WHITESPACE), notFollowedBy(IDENTIFIER, COMMA)
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

    if (typeof nextArg === 'object') {
      options = { ...options, ...nextArg };

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
      options = { ...options, args: options.args.concat(nextArg) };

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
