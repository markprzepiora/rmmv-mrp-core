import { findItem } from './database';

export function addItem(id, quantity = 1) {
  return $gameParty.gainItem(findItem(id), quantity);
}

export function clearItem(id) {
  addItem(id, -99999);
}
