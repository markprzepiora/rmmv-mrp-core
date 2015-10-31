function regexMatcher(type, regex) {
  return function(previousTokens, str) {
    var match;
    if (match = str.match(regex)) {
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
function nullMatcher(baseMatcher) {
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

function combineMatchers(firstMatcher, secondMatcher) {
  return function(previousTokens, str) {
    const firstMatch = firstMatcher(previousTokens, str);

    if (!firstMatch) {
      return null;
    }

    const [firstTokens, nextStr] = firstMatch;
    const secondMatch = secondMatcher([...previousTokens, ...firstTokens], nextStr);

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

const matchers = [
  nullMatcher(regexMatcher('WHITESPACE', /^\s+/)),
  combineMatchers(
    regexMatcher('KEY', /^[a-zA-Z_][a-zA-Z0-9_-]*/),
    regexMatcher('KEYVALSEP', /^:/)
  ),
  // combineMatchers(
  //   regexMatcher('BRA', /^</),
  //   regexMatcher('IDENTIFIER', /^[a-zA-Z_][a-zA-Z0-9-_]*/)
  // ),
  regexMatcher('BRA', /^</),
  regexMatcher('KET', /^>/),
  regexMatcher('COMMA', /^,/),
  regexMatcher('COLON', /^:/),
  regexMatcher('NUMBER', /^-?[0-9]+(\.[0-9]+)?/),
  regexMatcher('BOOLEAN', /^(true|false)/i),
  function(previousTokens, str) {
    var match;
    if (match = str.match(/^"([^"]|\\")*"/)) {
      return [
        [{ type: 'BARESTRING', token: JSON.parse(match[0]) }],
        str.slice(match[0].length)
      ];
    } else {
      return null;
    }
  },
  regexMatcher('BARESTRING', /^[^,:><"]+/)
]

function firstMatch(matchers, previousTokens, str) {
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

  while (str.length > 0) {
    [newTokens, newStr] = firstMatch(matchers, tokens, str) || [
      [{ type: 'UNKNOWN', token: str }], ""
    ];
    tokens = [...tokens, ...newTokens];

    // Make sure we don't get stuck in an infinite loop.
    if (newStr === str) {
      return tokens;
    }

    str = newStr;
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
  var args = { positional: [] };
  var result, nextArg, nextPos;

  while (result = parseArg(tokens, pos)) {
    [nextArg, nextPos] = result;

    if (typeof nextArg === 'object') {
      args = { ...args, ...nextArg };
    } else {
      args = { ...args, positional: args.positional.concat(nextArg) };
    }

    if (nextPos >= tokens.length || tokens[nextPos].type != 'COMMA') {
      return [args, nextPos];
    }

    pos = nextPos + 1;
  }

  return null;
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

function parse(str) {
  var parsed = parseAnonymousObject(lex(str), 0);
  if (parsed) {
    return parsed[0];
  } else {
    return null;
  }
}

export default parse;
