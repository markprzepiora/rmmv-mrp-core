import findIndex from 'ramda/src/findIndex';

export function findEvents(fn = () => true) {
  return $gameMap.events().map((e) => findEvent(e.eventId())).filter(fn);
}

export function findEvent(id) {
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

export function findEventByName(name) {
  const id = findIndex(
    (e) => e && (e.name === name),
    $dataMap.events
  );

  if (id < 0) {
    throw `could not find event with name ${name}`;
  }

  return findEvent(id);
}

export function event(idOrName) {
  if (typeof idOrName === 'number') {
    return findEvent(idOrName);
  } else {
    return findEventByName(idOrName);
  }
}

export function info() {
  return $dataMapInfos[$gameMap.mapId()];
}
