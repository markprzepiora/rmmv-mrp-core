import * as OSXFixes from './module/osx-fixes';

if (!window.MRP) {
  window.MRP = {};
}

OSXFixes.install();

window.MRP.OSXFixes = OSXFixes;
