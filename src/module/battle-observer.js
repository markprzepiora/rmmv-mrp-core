import ee from 'event-emitter';

// Example:
//
//   BattleObserver.on('turn.start', function() {
//     // do whatever...
//   });

const BattleObserver = ee({});

var _onBattleEnd = Game_Troop.prototype.onBattleEnd;
Game_Troop.prototype.onBattleEnd = function() {
  BattleObserver.emit('battle.end');
  _onBattleEnd.call(this);
}

var _onBattleStart = Game_Troop.prototype.onBattleStart;
Game_Troop.prototype.onBattleStart = function() {
  BattleObserver.emit('battle.start');
  _onBattleStart.call(this);
}

var _endTurn = BattleManager.endTurn.bind(BattleManager);
BattleManager.endTurn = function() {
  _endTurn();
  BattleObserver.emit('turn.end');
}

var _startTurn = BattleManager.startTurn.bind(BattleManager);
BattleManager.startTurn = function() {
  _startTurn();
  BattleObserver.emit('turn.start');
}

export default BattleObserver;
