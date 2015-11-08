if (!Utils.isNwjs()) {
  throw "rmmv-mrp-core/osx-fixes can only be run during development";
}

import gui from 'nw.gui';
import os from 'os';
import GameObserver from './game-observer';

// Are we inside nw.js, and are we running OSX?
const isOSX = os && (os.platform() === "darwin");

export function FixOSXCopyPaste() {
  if (isOSX) {
    var win = gui.Window.get();
    var nativeMenuBar = new gui.Menu({ type: "menubar" });
    nativeMenuBar.createMacBuiltin("Game");
    win.menu = nativeMenuBar;
  }
}

function _moveDevToolsWindow() {
  if (isOSX) {
    const dev = gui.Window.get().showDevTools();
    dev.x = 50;
    dev.y = 50;
  }
}

export function MoveDevToolsWindow() {
  if (isOSX) {
    var win = gui.Window.get();

    // YanFly's plugin sets the devtools position to 0,0 when the game starts.
    // So here we do it afterwards.
    GameObserver.on('game.start.after', function() {
      // If the devtools are already opened, move them immediately.
      if (win.isDevToolsOpen()) {
        _moveDevToolsWindow();
      }

      // Otherwise, move the window when the user opens it.
      win.once('devtools-opened', _moveDevToolsWindow);
    });
  }
}

export function InstallAllFixes() {
  if (isOSX) {
    FixOSXCopyPaste();
    MoveDevToolsWindow();
  }
}
