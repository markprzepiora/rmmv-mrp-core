# MRP.Map

## `MRP.Map.events()` or `MRP.Map.events(predicate)`

Find all events on the current map (first usage) or events matching the given
predicate. Events are of the following form,

```
{
  id: 123,
  definition: $dataMap.events[123],
  instance: $gameMap._events[123]
}
```

Example Usage:

```javascript
const spikes = Map.events((e) => e.definition.note === 'CASTLE_SPIKES');
```

## `MRP.Map.events()` or `MRP.Map.events(predicate)`

Find all events on the current map (first usage) or events matching the given
predicate. Events are of the following form,

```
{
  id: 123,
  definition: $dataMap.events[123],
  instance: $gameMap._events[123]
}
```

Example Usage:

```javascript
const spikes = Map.events((e) => e.definition.note === 'CASTLE_SPIKES');
```

## `MRP.Map.event(idOrName)`

Find an event on the current map by ID or name. Events are of the same form as
above.

Example Usage:

```javascript
const bigBoss = Map.event('BigBoss');
```

## `MRP.Map.info()`

Returns the current map's `$dataMapInfos` object, which is an object of the
form,

```javascript
{
  "id":       18,
  "expanded": false,
  "name":     "MAP018",
  "order":    11,
  "parentId": 10,
  "scrollX":  559,
  "scrollY":  391
}
```
