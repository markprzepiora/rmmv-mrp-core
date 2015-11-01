import { regex, or, skip, optional, seq, Lexer, Token } from '../src/OptionParser/LexerUtils';

JS.Test.describe("LexerUtils", function() {
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
});
