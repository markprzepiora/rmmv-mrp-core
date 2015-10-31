import OptionParser from '../src/OptionParser';

JS.Test.describe("OptionParser", function() {
  this.it("parses an anonymous object", function() {
    var payload = `
      <name: Gold Stars, number: 10, probability: 50>
    `;
    var object = OptionParser.parse(payload);

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
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'expected to get a result, got null');
    this.assertEqual(object.name, 'Gold Stars');
    this.assertEqual(object.number, 10);
    this.assertEqual(object.probability, 50);
  });

  this.it("parses quoted strings", function() {
    var payload =
      '<name: "Gold ,<> :Stars", number: 10, probability: 50>';

    var object = OptionParser.parse(payload);

    this.assertNotNull(object);
    this.assertEqual(object.name, "Gold ,<> :Stars");
    this.assertEqual(object.number, 10);
    this.assertEqual(object.probability, 50);
  });

  this.it("parses floats, booleans, and other edge cases", function() {
    var payload = `
      <negativeNumber: -5.0, aBoolean: true, anotherBoolean: False>
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'should get an object');
    this.assertEqual(-5.0, object.negativeNumber);
    this.assertEqual(true, object.aBoolean);
    this.assertEqual(false, object.anotherBoolean);
  });

  this.it("parses a named tag all by itself", function() {
    var payload = `
      <Currency>
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
  });

  this.it("parses a named object", function() {
    var payload = `
      <Currency name: Justice Points>
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Justice Points', object.name);
    this.assertEqual('Currency', object.type);
  });

  this.it("parses an object with positional args", function() {
    var payload = `
      <Currency "Justice Points", 5>
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points', 5], object.args);
  });

  this.it("parses an object with key-value pairs and positional args", function() {
    var payload = `
      <Currency Justice Points, probability: 0.5>
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points'], object.args);
    this.assertEqual(0.5, object.probability);
  });

  this.it("parses key-value pairs and positional args interspersed", function() {
    var payload = `
      <Currency Justice Points, probability: 0.5, "Foo">
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points', 'Foo'], object.args);
    this.assertEqual(0.5, object.probability);
  });

  this.it("parses a named object with a single bare-string argument", function() {
    var payload = `
      <Currency Justice Points>
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Currency', object.type);
    this.assertEqual(['Justice Points'], object.args);
  });

  this.it("does not parse bare strings with brackets", function() {
    var payload = `
      <Currency Justice < Points > lol>
    `;
    var object = OptionParser.parse(payload);

    this.assertNull(object);
  });
});
