// type: e.g. 'UNDERSCORE'
// token: e.g. '_'
// pos: the (starting) position in the string where it occurred
function Token(type, token, pos) {
  return { type, token, pos };
}

// tokens: an array of tokens
// newCharacterStream: a new character stream for the next lexer
function LexerResponse(tokens, newCharacterStream) {
  return { tokens, newCharacterStream };
}

// fullString: the underlying buffer
// pos: the 'zero' index of the stream
//
// str() returns the slice from position pos
// from(i) returns a new character stream starting at pos + i
//
// The calling code can pretend they're just dealing with the slice, but we
// keep track of where we are in the underlying string.
function CharacterStream(fullString, pos = 0) {
  return {
    fullString,
    pos,
    empty: pos >= fullString.length,
    str: () => fullString.slice(pos),
    from: (index) => CharacterStream(fullString, pos + index),
    Token: (type, token) => Token(type, token, pos),
    flush: () => CharacterStream(fullString, fullString.length)
  }
}

export function regex(type, regex, flags = '') {
  var massagedRegex = new RegExp(/^/.source + regex.source, flags);

  return function(previousTokens, charStream) {
    var match;
    if (match = charStream.str().match(massagedRegex)) {
      return LexerResponse(
        [charStream.Token(type, match[0])],
        charStream.from(match[0].length)
      );
    } else {
      return null;
    }
  }
}

// Like the regex matcher, but throws away the matched token.
export function skip(baseMatcher) {
  return function(previousTokens, charStream) {
    var match;
    if (match = baseMatcher(previousTokens, charStream)) {
      return LexerResponse([], match.newCharacterStream);
    } else {
      return null;
    }
  }
}

export function optional(matcher) {
  return function(previousTokens, charStream) {
    var match;
    if (match = matcher(previousTokens, charStream)) {
      return LexerResponse([], match.newCharacterStream);
    } else {
      return LexerResponse([], charStream);
    }
  }
}

export function seq2(first, second) {
  return function(previousTokens, charStream) {
    const firstMatch = first(previousTokens, charStream);

    if (!firstMatch) {
      return null;
    }

    const secondMatch =
      second([...previousTokens, ...firstMatch.tokens], firstMatch.newCharacterStream);

    if (!secondMatch) {
      return null;
    }

    return LexerResponse(
      [...firstMatch.tokens, ...secondMatch.tokens],
      secondMatch.newCharacterStream
    );
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
  return function(previousTokens, charStream) {
    const lastToken = previousTokens[previousTokens.length - 1];
    if (lastToken && lastToken.type == type) {
      return LexerResponse([], charStream);
    } else {
      return null;
    }
  }
}

export function map(fn, matcher) {
  return function(previousTokens, charStream) {
    var match;
    if (match = matcher(previousTokens, charStream)) {
      const mappedTokens = match.tokens.map(
        ({ type, token, pos }) => Token(type, fn(token), pos));

      return LexerResponse(
        mappedTokens, match.newCharacterStream);
    } else {
      return null;
    }
  }
}

export function or(...matchers) {
  return function(previousTokens, charStream) {
    var match;
    for (var i = 0; i < matchers.length; i++) {
      if (match = matchers[i](previousTokens, charStream)) {
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

    var charStream = CharacterStream(str);

    while (!charStream.empty) {
      var match =
        _lexer(tokens, charStream) ||
        LexerResponse(
          [charStream.Token('UNKNOWN', charStream.str())],
          charStream.str().length
        );

      tokens = [...tokens, ...match.tokens];

      if (counter++ > 10000) {
        throw "tried to lex more than 10,000 tokens - this is probably a bug.";
      }

      charStream = match.newCharacterStream;
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
