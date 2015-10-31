function regexMatcher(type, regex, flags = '') {
  var massagedRegex = new RegExp(/^/.source + regex.source, flags);

  return function(previousTokens, str) {
    var match;
    if (match = str.match(massagedRegex)) {
      return [
        [{ type: type, token: match[0] }],
        str.slice(match[0].length)
      ];
    } else {
      return null;
    }
  }
}

// Like the regex matcher, but throws away the matched token.
function skip(baseMatcher) {
  return function(previousTokens, str) {
    var match;
    if (match = baseMatcher(previousTokens, str)) {
      const [tokens, nextStr] = match;
      return [[], nextStr];
    } else {
      return null;
    }
  }
}

function optional(matcher) {
  return function(previousTokens, str) {
    var match;
    if (match = matcher(previousTokens, str)) {
      const [tokens, nextStr] = match;
      return [[], nextStr];
    } else {
      return [[], str];
    }
  }
}

function seq2(first, second) {
  return function(previousTokens, str) {
    const firstMatch = first(previousTokens, str);

    if (!firstMatch) {
      return null;
    }

    const [firstTokens, nextStr] = firstMatch;
    const secondMatch =
      second([...previousTokens, ...firstTokens], nextStr);

    if (!secondMatch) {
      return null;
    }

    const [secondTokens, outputNextStr] = secondMatch;

    return [
      [...firstTokens, ...secondTokens],
      outputNextStr
    ];
  }
}

function seq(firstMatcher, secondMatcher, thirdMatcher, ...rest) {
  const _seq2 = seq2(firstMatcher, secondMatcher);

  if (thirdMatcher) {
    return seq(_seq2, thirdMatcher, ...rest);
  } else {
    return _seq2;
  }
}

function precededByToken(type) {
  return function(previousTokens, str) {
    const lastToken = previousTokens[previousTokens.length - 1];
    if (lastToken && lastToken.type == type) {
      return [[], str];
    } else {
      return null;
    }
  }
}

function map(fn, matcher) {
  return function(previousTokens, str) {
    var match;
    if (match = matcher(previousTokens, str)) {
      const [newTokens, newStr] = match;
      const mappedTokens = newTokens.map(
        ({ type, token }) => ({ type: type, token: fn(token) }));

      return [mappedTokens, newStr];
    } else {
      return null;
    }
  }
}

const BRA          = regexMatcher('BRA', /</);
const KET          = regexMatcher('KET', />/);
const WHITESPACE   = skip(regexMatcher('WHITESPACE', /^\s+/));
const IDENTIFIER   = regexMatcher('IDENTIFIER', /[a-zA-Z_][a-zA-Z0-9-_]*/);
const KEY          = regexMatcher('KEY', /[a-zA-Z_][a-zA-Z0-9-_]*/);
const KEYVALSEP    = regexMatcher('KEYVALSEP', /:/);
const BARESTRING   = regexMatcher('BARESTRING', /[^,:><"]+/);
const COMMA        = regexMatcher('COMMA', /,/);
const NUMBER       = regexMatcher('NUMBER', /-?[0-9]+(\.[0-9]+)?/);
const BOOLEAN      = regexMatcher('BOOLEAN', /(true|false)/, 'i');
const QUOTEDSTRING = map(JSON.parse, regexMatcher('BARESTRING', /"([^"]|\\")*"/));

const matchers = [
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
];

function or(matchers, previousTokens, str) {
  var match;
  for (var i = 0; i < matchers.length; i++) {
    if (match = matchers[i](previousTokens, str)) {
      return match;
    }
  }

  return null;
}

function lex(str) {
  var tokens = [];
  var newTokens, newStr;
  var counter = 0;

  while (str.length > 0) {
    [newTokens, str] = or(matchers, tokens, str) || [
      [{ type: 'UNKNOWN', token: str }], ""
    ];
    tokens = [...tokens, ...newTokens];

    if (counter++ > 10000) {
      throw "tried to lex more than 10,000 tokens - this is probably a bug.";
    }
  }

  return tokens;
}

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

function parse(str) {
  var parsed =
    parseAnonymousObject(lex(str), 0) ||
    parseNamedObject(lex(str), 0);
  if (parsed) {
    return parsed[0];
  } else {
    return null;
  }
}

export default {
  parse: parse,
  lex: lex
};
