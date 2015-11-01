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

function parseArg(tokenStream) {
  return parseKeyVal(tokenStream) || parseVal(tokenStream);
}

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

function parseTokens(tokens) {
  var tokenStream = TokenStream(tokens);
  var parsed = parseAnonymousObject(tokenStream, 0) || parseNamedObject(tokenStream, 0);
  if (parsed) {
    return parsed[0];
  } else {
    return null;
  }
}

function parse(str) {
  return parseTokens(lex(str));
}

export default {
  parse: parse,
  lex: lex
};
