import OptionParser from '../src/OptionParser';

var anonymousObject =
  '<name: Gold Stars, number: 10, probability: 50>';

var namedObject =
  '<belongsToCurrency name: Gold Stars, number: 10, probability: 50>';

JS.Test.describe("OptionParser", function() {
  this.it("parses an anonymous object", function() {
    var object = OptionParser(anonymousObject);

    this.assertNotNull(object);
    this.assertEqual(object.name, 'Gold Stars');
    this.assertEqual(object.number, 10);
    this.assertEqual(object.probability, 50);
  });

  this.it("parses a named object", function() {
    var object = OptionParser(namedObject);

    this.assertNotNull(object, 'returned value should not be null, but was');
    this.assertEqual(object.type, 'belongsToCurrency');
    this.assertEqual(object.name, 'Gold Stars');
    this.assertEqual(object.number, 10);
    this.assertEqual(object.probability, 50);
  });
});
