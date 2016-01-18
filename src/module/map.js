import findIndex from 'ramda/src/findIndex';

export function events(fn = () => true) {
  return $gameMap.events().map((e) => Event(e.eventId())).filter(fn);
}

export function event(idOrName) {
  if (typeof idOrName === 'number') {
    return Event(idOrName);
  } else {
    return findEventByName(idOrName);
  }
}

export function info() {
  return $dataMapInfos[$gameMap.mapId()];
}

function Event(id) {
  const definition = $dataMap.events[id];
  const instance   = $gameMap._events[id];

  if (!definition) {
    throw `could not find event definition with id ${id}`;
  }

  if (!instance) {
    throw `could not find event instance with id ${id}`;
  }

  return { definition, instance, id };
}

function findEventByName(name) {
  const id = findIndex(
    (e) => e && (e.name === name),
    $dataMap.events
  );

  if (id < 0) {
    throw `could not find event with name ${name}`;
  }

  return Event(id);
}

