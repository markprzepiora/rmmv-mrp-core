import {
  regex, or, skip, optional, seq, Lexer, Token, precededByToken, map, repeat, concat, notFollowedBy,
  CharacterStream
} from '../lib/option-parser/lexer-utils';

JS.Test.describe("lexer-utils", function() {
  this.describe("regex", function() {
    this.it("parses an anonymous object", function() {
      const WORD   = regex('WORD', /\S+\s*/);
      const tokens = Lexer(WORD)('this is a string');

      this.assertEqual(
        [
          Token('WORD', 'this ',  0),
          Token('WORD', 'is ',    5),
          Token('WORD', 'a ',     8),
          Token('WORD', 'string', 10)
        ],
        tokens
      );
    });
  });

  this.describe("or", function() {
    this.it("chooses the first matching lexer", function() {
      const WHITESPACE = regex('WHITESPACE', /\s+/);
      const NUMBER     = regex('NUMBER', /[0-9]+/);
      const WORD       = regex('WORD', /\S+/);
      const tokens     = Lexer(or(WHITESPACE, NUMBER, WORD))('foo  123 bar');

      this.assertEqual(
        [
          Token('WORD',       'foo', 0),
          Token('WHITESPACE', '  ',  3),
          Token('NUMBER',     '123', 5),
          Token('WHITESPACE', ' ',   8),
          Token('WORD',       'bar', 9)
        ],
        tokens
      );
    });
  });

  this.describe("skip", function() {
    this.it("matches a lexer but does not output its tokens", function() {
      const WHITESPACE = skip(regex('WHITESPACE', /\s+/));
      const WORD       = regex('WORD', /\S+/);
      const tokens     = Lexer(or(WHITESPACE, WORD))('foo bar');

      this.assertEqual(
        [
          Token('WORD', 'foo', 0),
          Token('WORD', 'bar', 4),
        ],
        tokens
      );
    });
  });

  this.describe("optional", function() {
    this.it("optionally matches a lexer but does not output its tokens either way", function() {
      const WHITESPACE = optional(regex('WHITESPACE', /\s+/));
      const COLON      = regex('COLON', /:/);
      const WORD       = regex('WORD', /[a-z]+/);

      const tokens = Lexer(seq(
        WHITESPACE, WORD, WHITESPACE, COLON, WHITESPACE, WORD, WHITESPACE))('key: val ');

      this.assertEqual(
        [
          Token('WORD',  'key', 0),
          Token('COLON', ':',   3),
          Token('WORD',  'val', 5),
        ],
        tokens
      );
    });
  });

  this.describe("precededByToken", function() {
    this.it("matches a lexer only if preceded by another token", function() {
      const KEY   = regex('KEY', /[a-z]+/);
      const COLON = regex('COLON', /:/);
      const VAL   = seq(precededByToken('COLON'), regex('VAL', /[a-z]+/));

      const tokens = Lexer(or(COLON, VAL, KEY))('foo:bar');

      this.assertEqual(
        [
          Token('KEY', 'foo', 0),
          Token('COLON', ':', 3),
          Token('VAL', 'bar', 4),
        ],
        tokens
      );
    });
  });

  this.describe(".map", function() {
    this.it("applies a map function to all token values returned by a lexer", function() {
      const NUMBER = map(Number, regex('NUMBER', /[0-9]+/));
      const WHITESPACE = skip(regex('WHITESPACE', /\s+/));
      const tokens = Lexer(or(NUMBER, WHITESPACE))('123 789');

      this.assertEqual(
        [
          Token('NUMBER', 123, 0),
          Token('NUMBER', 789, 4),
        ],
        tokens
      );
    });
  });

  this.describe(".repeat", function() {
    this.it("repeats a lexer until it produces no more matches", function() {
      const WORD  = regex('WORD', /\S+\s?/);
      const WORDS = repeat(WORD);
      const { tokens } = WORDS([], CharacterStream('foo bar baz'));

      this.assertEqual([
        Token('WORD', 'foo ', 0),
        Token('WORD', 'bar ', 4),
        Token('WORD', 'baz',  8)
      ], tokens);
    });
  });

  this.describe(".concat", function() {
    this.it("concatenates the string-valued tokens returned by a matcher", function() {
      const WORD = regex('WORD', /\S+\s?/);
      const WORDS = repeat(WORD);
      const PHRASE = concat('PHRASE', WORDS);
      const tokens = Lexer(PHRASE)('this is a phrase');

      this.assertEqual([Token('PHRASE', 'this is a phrase', 0)], tokens);
    });
  });

  this.describe(".notFollowedBy", function() {
    this.it("lexes using a lexer only if the second lexer does not match afterwards", function() {
      const WORD            = regex('WORD', /[a-z]+/);
      const NUMBER          = regex('NUMBER', /[0-9]+/);
      const UNSUFFIXED_WORD = notFollowedBy(WORD, NUMBER);

      const match = UNSUFFIXED_WORD([], CharacterStream('foo'));
      const notAMatch = UNSUFFIXED_WORD([], CharacterStream('foo1'));

      this.assertEqual([Token('WORD', 'foo', 0)], match.tokens);
      this.assertNull(notAMatch);
    });
  });
});
