import {
  lex, parse, extractAll, extractAllOfType, extractFirst, extractFirstOfType
} from '../src/OptionParser';

JS.Test.describe("OptionParser", function() {
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
});
