# MRP.GameObserver

## Event Emitter

`MRP.GameObserver` is an event-emitter for listening to game events.

Example:

```js
MRP.GameObserver.on('turn.start', function() {
  // do whatever at the start of each battle turn.
});
```

Implemented events:

- `turn.start`, `turn.end`
- `battleAction.start`, `battleAction.end`
- `battle.start`, `battle.end`
- `game.start` is triggered when the game first launches to the title screen.
- `map.setup` is triggered when a map loads or changes.
- `player.move` is triggered whenever the player moves on the map.

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

## Other events

The API below is provided for convenience--it can be implemented yourself using
the events above.

### `MRP.GameObserver.onMap(mapNameOrID, callback)`

Use this to register a callback to fire when a map with the specified ID or
name is entered. Returns a function `off()` which you can use to turn off the
observer when you don't need it anymore.

### `MRP.GameObserver.onRegion(regionID, callback)`

Use this to register a callback to fire when a player enters a tile of the
specified region number. As above, this returns an `off()` function.

### Example Usage

```javascript
MRP.GameObserver.onMap("Desert", function() {
  // When the player enters quicksand
  var off = MRP.GameObserver.onRegion(10, function() {
    // Uh oh...
  });

  // When we leave this map, disable the onRegion observer.
  MRP.GameObserver.on('map.setup', off);
});
```
