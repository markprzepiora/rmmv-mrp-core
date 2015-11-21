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

[Click here to read.](docs/OptionParser.md)

## `MRP.GameObserver`

[Click here to read.](docs/GameObserver.md)

## `MRP.MapExporter`

[Click here to read.](docs/MapExporter.md)

## `MRP.OSXFixes`

[Click here to read.](docs/OSXFixes.md)

## `MRP.Geometry`

[Click here to read.](docs/Geometry.md)
