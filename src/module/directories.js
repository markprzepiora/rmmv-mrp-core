import gui from 'nw.gui';
import path from 'path';

export function gameDir() {
  const args     = gui.App.fullArgv;
  const uriMatch = args.map((s) => s.match(/file:\/\/.*/))[0];

  if (uriMatch) {
    return path.dirname(decodeURI(uriMatch[0].slice(7)));
  } else {
    return null;
  }
}

export function homeDir() {
  return window.process.env.HOME || window.process.env.USERPROFILE;
}
