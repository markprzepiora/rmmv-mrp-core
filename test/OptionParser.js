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

  this.it("parses a named object", function() {
    var payload = `
      <Currency name: Justice Points>
    `;
    var object = OptionParser.parse(payload);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual('Justice Points', object.name);
    this.assertEqual('Currency', object.type);
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
});
