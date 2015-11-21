import {
  lex, parse, extractAll, extractAllOfType, extractFirst, extractFirstOfType, _tokenize
} from '../src/module/option-parser';

JS.Test.describe("option-parser", function() {
  this.it("parse parses a simple array of args", function() {
    var payload = `
      <foo, "bar", 3>
    `;
    var object = parse(payload);

    this.assertNotNull(object);
    this.assertEqual({ args: ['foo', 'bar', 3] }, object);
  });

  this.it("parse parses an anonymous object", function() {
    var payload = `
      <name: Gold Stars, number: 10, probability: 50>
    `;
    var object = parse(payload);

    this.assertNotNull(object);
    this.assertEqual(object.name, 'Gold Stars');
    this.assertEqual(object.number, 10);
    this.assertEqual(object.probability, 50);
  });

  this.it("doesn't freak out about whitespace", function() {
    var payload = `
      <
        name:
          Gold Stars,
        number:
          10,
        probability:
          50
      >
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'expected to get a result, got null');
    this.assertEqual(object.name, 'Gold Stars');
    this.assertEqual(object.number, 10);
    this.assertEqual(object.probability, 50);
  });

  this.it("does not loop infintely on a blank string", function() {
    var object = parse("");
    this.assertNull(object);
  });

  this.it("parses quoted strings", function() {
    var payload =
      '<name: "Gold ,<> :Stars", number: 10, probability: 50>';

    var object = parse(payload);

    this.assertNotNull(object);
    this.assertEqual(object.name, "Gold ,<> :Stars");
    this.assertEqual(object.number, 10);
    this.assertEqual(object.probability, 50);
  });

  this.it("parses floats, booleans, and other edge cases", function() {
    var payload = `
      <negativeNumber: -5.0, aBoolean: true, anotherBoolean: False>
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'should get an object');
    this.assertEqual(-5.0, object.negativeNumber);
    this.assertEqual(true, object.aBoolean);
    this.assertEqual(false, object.anotherBoolean);
  });

  this.it("parses a named tag all by itself", function() {
    var payload = `
      <Currency>
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
  });

  this.it("parses a name with a dash", function() {
    var payload = `
      <my-tag>
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('my-tag', object.type);
  });

  this.it("parses a named object", function() {
    var payload = `
      <Currency name: Justice Points>
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Justice Points', object.name);
    this.assertEqual('Currency', object.type);
  });

  this.it("parses an object with positional args", function() {
    var payload = `
      <Currency "Justice Points", 5>
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points', 5], object.args);
  });

  this.it("parses an object with key-value pairs and positional args", function() {
    var payload = `
      <Currency Justice Points, probability: 0.5>
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points'], object.args);
    this.assertEqual(0.5, object.probability);
  });

  this.describe("optional commas between key-value pairs", function() {
    this.it("makes commas between key-value pairs optional", function() {
      var payload = '<currencyShop belongsTo: "sample name" andCosts: 25>';
      var optionsList = parse(payload, 'currencyShop');

      this.assertEqual({ type: 'currencyShop', belongsTo: 'sample name', andCosts: 25, args: [] }, optionsList);
    });

    this.it("makes commas between key-value pairs optional even with bare string values", function() {
      var payload = '<currencyShop belongsTo: sample name andCosts: 25>';
      var optionsList = parse(payload, 'currencyShop');

      this.assertEqual({ type: 'currencyShop', belongsTo: 'sample name', andCosts: 25, args: [] }, optionsList);
    });

    this.it("still requires positional args to be separated by commas", function() {
      var payload = '<currencyShop belongsTo: "sample name" andCosts: 25 foo, bar, baz>';
      var optionsList = parse(payload, 'currencyShop');

      this.assertNull(optionsList);
    });

    this.it("works with positional args", function() {
      var payload = '<belongsTo: "sample name", foo, bar, baz>';
      var optionsList = parse(payload, 'currencyShop');

      this.assertEqual({ belongsTo: 'sample name', args: ['foo', 'bar', 'baz'] }, optionsList);
    });
  });

  this.it("parses key-value pairs and positional args interspersed", function() {
    var payload = `
      <Currency Justice Points, probability: 0.5, "Foo">
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points', 'Foo'], object.args);
    this.assertEqual(0.5, object.probability);
  });

  this.it("parses a named object with a single bare-string argument", function() {
    var payload = `
      <Currency Justice Points>
    `;
    var object = parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points'], object.args);
  });

  this.it("does not parse bare strings with brackets", function() {
    var payload = `
      <Currency Justice < Points > lol>
    `;
    var object = parse(payload);

    this.assertNull(object);
  });

  this.describe("extracting tags from strings", function() {
    var payload = `
      this is something else, blah blah
        <Currency name: "Foo">
      and some more text
        <CostsCurrency>
      Bleh
    `;

    this.it("extractAll finds all tags inside an arbitrary string", function() {
      var optionsList = extractAll(payload);

      this.assertKindOf(Array, optionsList, "should get a list back");
      this.assertEqual(2, optionsList.length, "should get two option objects back");

      var [firstOptions, secondOptions] = optionsList;

      this.assertEqual({ type: 'Currency', name: 'Foo', args: [] }, firstOptions);
      this.assertEqual({ type: 'CostsCurrency', args: [] }, secondOptions);
    });

    this.it("extractAllOfType allows an exact matching type to be specified", function() {
      var optionsList = extractAllOfType(payload, 'Currency');

      this.assertKindOf(Array, optionsList, "should get a list back");
      this.assertEqual(1, optionsList.length, "should get only one option back");
      this.assertEqual([{ type: 'Currency', name: 'Foo', args: [] }], optionsList);
    });

    this.it("extractFirst finds the first tag inside an arbitrary string", function() {
      var opts = extractFirst(payload);

      this.assertNotNull(opts);
      this.assertEqual({ type: 'Currency', name: 'Foo', args: [] }, opts);
    });

    this.it("extractFirst returns null if no tag exists in the string", function() {
      var opts = extractFirst(`
        this string contains no options tags
      `);

      this.assertNull(opts);
    });

    this.it("extractFirstOfType finds the first tag of a certain type", function() {
      var opts = extractFirstOfType(payload, 'CostsCurrency');

      this.assertNotNull(opts);
      this.assertEqual({ type: 'CostsCurrency', args: [] }, opts);
    });

    this.it("extractFirstOfType returns null if no tag of that type exists", function() {
      var opts = extractFirstOfType(payload, 'FooBar');

      this.assertNull(opts);
    });
  });

  this.describe("strings with escape characters", function() {
    this.it("parses escaped backslashes", function() {
      const slash = '\\';
      const payload = `
        <foo "${slash}${slash}${slash}${slash}c">
      `;
      const opts = parse(payload);

      this.assertEqual(slash + slash + "c", opts.args[0]);
    });

    this.it("parses escaped quotes", function() {
      const slash = '\\';
      const payload = `
        <foo "${slash}"">
      `;
      const opts = parse(payload);

      this.assertEqual('"', opts.args[0]);
    });
  });

  this.describe("string literals with linebreaks", function() {
    this.it("parses string literals with linebreaks", function() {
      const payload = `
<my-tag "
foo
bar
baz
 ">
      `;
      const opts = parse(payload);

      this.assertEqual("\nfoo\nbar\nbaz\n ", opts.args[0]);
    });
  });

  this.describe("text blocks", function() {
    this.it("parses a tag with a block of text", function() {
      const opts = parse(`
        <my-tag foo: "bar">This is a "block" of "
text" inside.</my-tag>
      `);

      this.assertNotNull(opts);
      this.assertEqual('my-tag', opts.type);
      this.assertEqual('bar', opts.foo);
      this.assertEqual(`This is a "block" of "
text" inside.`, opts.block);
    });

    this.it("parses a tag with a block of text containing its own tags", function() {
      const opts = parse(`
        <my-tag>foo <b>bar</b> baz</my-tag>
      `);

      this.assertNotNull(opts);
      this.assertEqual(`foo <b>bar</b> baz`, opts.block);
    });
  });
});
