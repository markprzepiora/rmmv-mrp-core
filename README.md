# RPG Maker MV Core Extensions

This repository is a work-in-progress. You probably do not want to use it.

## Instructions (Browserify)

Add to your project: `npm install --save-dev markprzepiora/rmmv-mrp-core`

Example usage:

```javascript
import { extractAll } from 'rmmv-mrp-core/lib/OptionParser';

console.log(extractAll(`
  this is a test
    <Currency name: Gold Stars, number: 10, probability: 50>
  this is a test
`));
```

In the console you should see the following object:

```
{
  type: 'Currency',
  name: 'Gold Stars',
  number: 10,
  probability: 50,
  args: []
}
```

## Usage (Directly in RPG Maker MV)

1. Add `dist/rmmv-mrp-core.js` to your `plugins` folder.
2. ???
