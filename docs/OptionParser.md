# `MRP.OptionParser`

Never again write brittle regexes for parsing configuration settings. The `OptionParser` module allows your users to define settings written in a familiar, human-readable syntax.

## Syntax Example 1 (a named object with positional arguments)

The first identifier after a `<` becomes the object's `type`. Just as if you were writing an HTML tag. Positional arguments may be given directly after it, separated by commas, and closed with another `>`.

Input (string):

    <FullCharacterName Sakura, Kinomoto>

Output (JS object):

```js
{ type: 'FullCharacterName', args: ['Sakura', 'Kinomoto'] }
```

## Syntax Example 2 (an anonymous object with key-value pairs)

Arguments can be named, and objects do not need to be named. Note that even though this example does not contain any positional arguments, the parsed object will still contain an empty `args` array.

Input (string):

    <firstName: Sakura, lastName: Kinomoto>

Output (JS object):

```js
{ firstName: 'Sakura', lastName: 'Kinomoto', args: [] }
```

## Syntax Example 3 (a named object with positional args *and* key-value pairs)

Examples 1 and 2 above can be combined.

Input (string):

    <CatNames Belldandy, Jester, crazy: true>

Output (JS object):

```js
{ type: 'CatNames', args: ['Belldandy', 'Jester'], crazy: true }
```

## Syntax Example 4 (optional commas separating key-value pairs)

The commas separating key-value pairs are optional.

Input (string):

    <Currency name: Gold Stars symbol: "$">

Output (JS object):

```js
{ type: 'Currency', name: 'Gold Stars', symbol: '$', args: [] }
```

## Syntax Example 5 (value types)

The `OptionParser` syntax supports several types of primitives:

- Bare strings (as seen above). Example: `Foo Bar Baz`
- Double-quoted strings, escaped using typical JS rules. Example: `"Foo Bar \n Baz"`
- Numbers. Examples: `123`, `-5.5`
- Booleans. Examples: `True`, `false`, `FALSE`.

Input:

    <Cat name: "Belldandy Przepiora"  age: 8  spayed: true  livesRemaining: 8.5>

Output (JS object):

```js
{ type: 'Cat', name: 'Belldandy Przepiora', age: 8, spayed: true, args: [] }
```

## Syntax Example 6 (text blocks)

The `OptionParser` syntax supports a block of text inside opening and closing tags, in an XML-like syntax.

Input:

    <Cat name: "Belldandy">
    This is the best kitty cat in the whole wide world.
    </Cat>

Output:

```js
{ type: 'Cat', args: [], name: 'Przepiora', block: "This is the best kitty cat in the whole wide world." }
```

Although the block is returned as a string, you could use this to create nested options, by parsing the block too.

Example:

    <cat name: Belldandy>
      <favourite-foods fishies, plastic>
    </cat>

Code:

```js
var cat = MRP.OptionParser.parse(text);
// { type: 'cat', args: [], name: 'Belldandy', block: "<name ..." }

var props = MRP.OptionParser.extractAll(text.block);
// [
//   { type: 'favourite-foods', args: ['fishies', 'plastic'] }
// ]
```

## Functions

### `MRP.OptionParser.parse(str)`

Parse a single object from a string. Returns `null` in case of a syntax error. You might want to use this to parse a plugin parameter.

![](http://i.imgur.com/chbT1cM.png)

### `MRP.OptionParser.extractAll(str)`

Parse all objects contained in a string and return an array of them, even if they are surrounded by unrelated text. You might want to use this to extract configuration settings a user defines in, say, an item note.

![](http://i.imgur.com/DiwPasS.png)

### `MRP.OptionParser.extractAllOfType(str, type)`

Like above, but extracts only objects of the specified type.

![](http://i.imgur.com/lm7QDZu.png)

### `MRP.OptionParser.extractFirst(str)`

Like `extractAll`, but returns the first match or `null` if none exists.

### `MRP.OptionParser.extractFirstOfType(str, type)`

Like `extractAllOfType`, but returns the first match or `null` if none exists.
