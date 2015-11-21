# MRP.GameObserver

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
