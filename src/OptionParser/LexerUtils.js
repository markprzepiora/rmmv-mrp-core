export function regex(type, regex, flags = '') {
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
export function skip(baseMatcher) {
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

export function optional(matcher) {
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

export function seq2(first, second) {
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

export function seq(firstMatcher, secondMatcher, thirdMatcher, ...rest) {
  const _seq2 = seq2(firstMatcher, secondMatcher);

  if (thirdMatcher) {
    return seq(_seq2, thirdMatcher, ...rest);
  } else {
    return _seq2;
  }
}

export function precededByToken(type) {
  return function(previousTokens, str) {
    const lastToken = previousTokens[previousTokens.length - 1];
    if (lastToken && lastToken.type == type) {
      return [[], str];
    } else {
      return null;
    }
  }
}

export function map(fn, matcher) {
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

export function or(...matchers) {
  return function(previousTokens, str) {
    var match;
    for (var i = 0; i < matchers.length; i++) {
      if (match = matchers[i](previousTokens, str)) {
        return match;
      }
    }

    return null;
  }
}

export function Lexer(_lexer, str) {
  return function(str) {
    var tokens = [];
    var newTokens, newStr;
    var counter = 0;

    while (str.length > 0) {
      [newTokens, str] = _lexer(tokens, str) || [
        [{ type: 'UNKNOWN', token: str }], ""
      ];
      tokens = [...tokens, ...newTokens];

      if (counter++ > 10000) {
        throw "tried to lex more than 10,000 tokens - this is probably a bug.";
      }
    }

    return tokens;
  }
}

function TokenStream(tokens, pos = 0) {
  const present = pos < tokens.length;

  function next() {
    return TokenStream(tokens, pos + 1);
  }

  function type() {
    if (!present) {
      throw `no token at position ${pos}`;
    }

    return tokens[pos].type;
  }

  function token() {
    if (!present) {
      throw `no token at position ${pos}`;
    }

    return tokens[pos].token;
  }

  return {
    present,
    next,
    type,
    token
  };
}
