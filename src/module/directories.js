const gui = window.require('nw.gui');
const path = window.require('path');
const os = window.require('os');

export function gameDir() {
  const args     = gui.App.fullArgv;
  const uriMatch = args.map((s) => s.match(/file:\/\/.*/))[0];

  // On Windows, we do not want the leading slash to end up in the filename, so
  // we hack it off.
  const sliceIndex = os.platform() === 'win32' ? 8 : 7;

  if (uriMatch) {
    return path.dirname(decodeURI(uriMatch[0].slice(sliceIndex)));
  } else {
    return null;
  }
}

export function homeDir() {
  return window.process.env.HOME || window.process.env.USERPROFILE;
}
