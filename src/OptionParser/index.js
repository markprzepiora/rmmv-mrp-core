import {
  regex, skip, optional, map, precededByToken, seq, or, Lexer
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

parse_ARG =
  parse_KEY:VAL or parse_VAL

parse_VAL =

*/

function parseArgs(tokens, pos) {
  var options = { args: [] };
  var result, nextArg, nextPos;

  while (result = parseArg(tokens, pos)) {
    [nextArg, nextPos] = result;

    if (typeof nextArg === 'object') {
      options = { ...options, ...nextArg };
    } else {
      options = { ...options, args: options.args.concat(nextArg) };
    }

    if (nextPos >= tokens.length || tokens[nextPos].type != 'COMMA') {
      return [options, nextPos];
    }

    pos = nextPos + 1;
  }

  return [options, pos];
}

function parseArg(tokens, pos) {
  return parseKeyVal(tokens, pos) || parseVal(tokens, pos);
}

function parseVal(tokens, pos) {
  if (pos >= tokens.length) {
    return null;
  }

  var token = tokens[pos];

  switch(token.type) {
    case 'NUMBER':     return [Number(token.token), pos + 1];
    case 'BARESTRING':
    case 'KEY':        return [token.token,         pos + 1];
    case 'BOOLEAN':    return [token.token.toLowerCase() === 'true' ? true : false, pos + 1];
    default:           return null;
  }
}

function parseKeyVal(tokens, pos) {
  if (pos + 2 >= tokens.length) {
    return null;
  }

  const [t1, t2, t3] = tokens.slice(pos, pos + 3);

  if (t1.type != 'KEY' || t2.type != 'KEYVALSEP') {
    return null;
  }

  const val = parseVal(tokens, pos + 2);

  if (!val) {
    return null;
  }

  return [{ [t1.token]: val[0] }, pos + 3];
}

function parseAnonymousObject(tokens, pos) {
  var x = 0;

  if (pos + 2 >= tokens.length) {
    return null;
  }

  const firstToken = tokens[pos];

  if (firstToken.type != 'BRA') {
    return null;
  }

  const argsMatch = parseArgs(tokens, pos + 1);

  if (!argsMatch) {
    return null;
  }

  const [object, ketPos] = argsMatch;

  if (ketPos >= tokens.length) {
    return null;
  }

  if (tokens[ketPos].type != 'KET') {
    return null;
  }

  return [object, ketPos + 1];
}

function parseNamedObject(tokens, pos) {
  var x = 0;

  if (pos + 2 >= tokens.length) {
    return null;
  }

  const firstToken = tokens[pos];
  const secondToken = tokens[pos + 1];

  if (firstToken.type != 'BRA' || secondToken.type != 'IDENTIFIER') {
    return null;
  }

  const argsMatch = parseArgs(tokens, pos + 2);

  if (!argsMatch) {
    return null;
  }

  const [object, ketPos] = argsMatch;

  if (ketPos >= tokens.length) {
    return null;
  }

  if (tokens[ketPos].type != 'KET') {
    return null;
  }

  return [{ ...object, type: secondToken.token }, ketPos + 1];
}

function parseTokens(tokens) {
  var parsed = parseAnonymousObject(tokens, 0) || parseNamedObject(tokens, 0);
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
