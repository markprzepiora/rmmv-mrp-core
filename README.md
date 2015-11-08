# RPG Maker MV Core Utilities

A collection of utilities to use in your RPG Maker MV games and plugins.

# Usage

## Directly in RPG Maker

This is probably what you will want to do.

1. Add `dist/rmmv-mrp-core.js` to your `plugins` folder.
2. A global `window.MRP` object will be available in any plugin loaded after `rmmv-mrp-core`, which will contain all utilities described below.

## Browserify

If you are developing your plugins using Browserify, you can load in only the modules you need.

First, add the `rmmv-mrp-core` module to your project:

    npm install --save-dev rmmv-mrp-core

You can now import an individual module and use it.

Example usage (ES6 modules):

```javascript
import { extractAll } from 'rmmv-mrp-core/option-parser';

console.log(extractFirst(`
  some preceding text
  <Currency name: Gold Stars, number: 10, probability: 50>
  some more text afterwards
`));
```

# Modules

## `MRP.OptionParser`

Never again write brittle regexes for parsing configuration settings. The `OptionParser` module allows your users to define settings written in a familiar, human-readable syntax.

### Syntax Example 1 (a named object with positional arguments)

The first identifier after a `<` becomes the object's `type`. Just as if you were writing an HTML tag. Positional arguments may be given directly after it, separated by commas, and closed with another `>`.

Input (string):

    <FullCharacterName Sakura, Kinomoto>

Output (JS object):

```js
{ type: 'FullCharacterName', args: ['Sakura', 'Kinomoto'] }
```

### Syntax Example 2 (an anonymous object with key-value pairs)

Arguments can be named, and objects do not need to be named. Note that even though this example does not contain any positional arguments, the parsed object will still contain an empty `args` array.

Input (string):

    <firstName: Sakura, lastName: Kinomoto>

Output (JS object):

```js
{ firstName: 'Sakura', lastName: 'Kinomoto', args: [] }
```

### Syntax Example 3 (a named object with positional args *and* key-value pairs)

Examples 1 and 2 above can be combined.

Input (string):

    <CatNames Belldandy, Jester, crazy: true>

Output (JS object):

```js
{ type: 'CatNames', args: ['Belldandy', 'Jester'], crazy: true }
```

### Syntax Example 4 (optional commas separating key-value pairs)

The commas separating key-value pairs are optional.

Input (string):

    <Currency name: Gold Stars symbol: "$">

Output (JS object):

```js
{ type: 'Currency', name: 'Gold Stars', symbol: '$', args: [] }
```

### Syntax Example 5 (value types)

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

### Functions

#### `MRP.OptionParser.parse(str)`

Parse a single object from a string. Returns `null` in case of a syntax error. You might want to use this to parse a plugin parameter.

![](http://i.imgur.com/chbT1cM.png)

#### `MRP.OptionParser.extractAll(str)`

Parse all objects contained in a string and return an array of them, even if they are surrounded by unrelated text. You might want to use this to extract configuration settings a user defines in, say, an item note.

![](http://i.imgur.com/DiwPasS.png)

#### `MRP.OptionParser.extractAllOfType(str, type)`

Like above, but extracts only objects of the specified type.

![](http://i.imgur.com/lm7QDZu.png)

#### `MRP.OptionParser.extractFirst(str)`

Like `extractAll`, but returns the first match or `null` if none exist.

#### `MRP.OptionParser.extractFirstOfType(str, type)`

Like `extractAllOfType`, but returns the first match or `null` if none exist.

### `MRP.GameObserver`

A simple event-emitter interface for listening to game events.

Example:

```js
MRP.GameObserver.on('turn.start', function() {
  // do whatever at the start of each battle turn.
});
```

Implemented events:

- `turn.start`, `turn.end`
- `battle.start`, `battle.end`
- `game.start` is triggered when the game first launches to the title screen.
- `map.setup` is triggered when a map loads or changes.

Each event has a `.before` and `.after` variant. (The `.after` variant is
simply an alias for the bare event name.) The `.before` variant fires *before*
the native function does, and the `.after` variant fires *after* the native
function does. Depending on what you're hooking into, this difference may be
significant.

```js
MRP.GameObserver.on('turn.start.before', function() {
  // Will fire before startTurn.startTurn does.
});

MRP.GameObserver.on('turn.start.after', function() {
  // Will fire after startTurn.startTurn does.
});
```

## `MRP.MapExporter`

Simply call `MRP.MapExporter();` inside your console or through an event to
take and save a screenshot of the entire map, without your character (but all
events) present.

Screenshots are saved to your game folder in a subfolder called `MapExporter`.

This might fail for very large maps, depending on how limited your computer's
resources are. You may either get a blank PNG, or your game may crash. In this
case, you can pass an optional named parameter to `MRP.MapExporter()` like so,

```js
MRP.MapExporter({ pagesPerImage: 3 });
```

Doing this will save a sequence of images, each one at most 3 screen widths
across and down in size. The files will be suffixed with `00`, `01`, `10`,
`11`, and so on, with the first number giving the `x` value, and the second
number giving the `y` value. You can connect these together manually in
Photoshop or Gimp to get a full image.

## `MRP.OSXFixes`

If you are using the `rmmv-mrp-core.js` bundle then these are loaded
automatically if needed.

What this fixes:

- Copy + Paste now works inside devtools. (!!!)
- Moves the devtools window over a little bit so that its menu bar is visible.
  (YanFly's Core plugin moves this to the 0, 0 position on the screen, which
  makes this window impossible to move.)

## `MRP.Geometry`

This is a JavaScript object of various game and map geometry facts. Its values
are updated automatically when the current map changes.

It has the following keys:

- `TILE_WIDTH_PX`, `TILE_HEIGHT_PX` - The pixel dimensions of each individual
  tile (i.e., the tile size). In a typical game, this will be 48x48.
- `SCREEN_WIDTH_PX`, `SCREEN_HEIGHT_PX` - The pixel width and height of the visible
  screen (i.e., the game resolution). In a typical game, this will be 816x624.
- `SCREEN_WIDTH_TILES`, `SCREEN_HEIGHT_TILES` - The number of columns and rows
  of tiles visible on the screen at one time. In a typical game, this will be
  17x13. Note that these are *not guaranteed to be whole numbers*.
- `MAP_WIDTH_TILES`, `MAP_HEIGHT_TILES` - The map size measured in tiles.
- `MAP_WIDTH_PX`, `MAP_HEIGHT_PX` - The map size measured in pixels.
- `MAP_WIDTH_PAGES`, `MAP_HEIGHT_PAGES` - The map size measured in "pages",
  that is the whole number of times we would have to move the camera in each
  direction to see the entire map.

Note that until the game begins running (see GameObserver's `game.start`
event), all of these values will be `null`. After `game.start` triggers,
`SCREEN_WIDTH_PX` and `SCREEN_HEIGHT_PX` will be populated. Once a map is
loaded, the rest of the values are populated.
