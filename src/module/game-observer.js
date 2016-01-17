import ee from 'event-emitter';
import * as Map from './map';

// Example:
//
//   GameObserver.on('turn.start', function() {
//     // do whatever...
//   });

const GameObserver = ee({});

function overridePrototypeMethod(constructor, functionName, fn) {
  const _super = constructor.prototype[functionName];
  constructor.prototype[functionName] = function() {
    return fn(_super.bind(this), ...arguments);
  }
}

function overrideSingletonMethod(object, functionName, fn) {
  const _super = object[functionName];
  object[functionName] = function() {
    return fn(_super.bind(object), ...arguments);
  }
}

function eventize(decorator, constructor, functionName, eventName) {
  decorator(constructor, functionName, function(_super, ...args) {
    GameObserver.emit(eventName + ".before");
    _super(...args);
    GameObserver.emit(eventName + ".after");
    GameObserver.emit(eventName);
  });
}

function eventizePrototypeMethod(constructor, functionName, eventName) {
  eventize(overridePrototypeMethod, constructor, functionName, eventName);
}

function eventizeSingletonMethod(object, functionName, eventName) {
  eventize(overrideSingletonMethod, object, functionName, eventName);
}

eventizePrototypeMethod(Game_Troop,     'onBattleStart',  'battle.start');
eventizePrototypeMethod(Game_Troop,     'onBattleEnd',    'battle.end');
eventizePrototypeMethod(Game_Map,       'setup',          'map.setup');
eventizeSingletonMethod(BattleManager,  'endTurn',        'turn.end');
eventizeSingletonMethod(BattleManager,  'startTurn',      'turn.start');
eventizeSingletonMethod(SceneManager,   'run',            'game.start');
eventizePrototypeMethod(Game_Player,    'executeMove',    'player.move');

GameObserver.onMap = function onMap(mapName, callback) {
  GameObserver.on('map.setup', function() {
    if (Map.info().name === mapName) {
      callback();
    }
  });
};

GameObserver.onRegion = function onRegion(regionID, callback) {
  function off() {
    GameObserver.off(observer);
  }

  GameObserver.on('player.move', function observer() {
    if ($gamePlayer.regionId() === regionID) {
      callback();
    }
  });

  return off;
};

export default GameObserver;
