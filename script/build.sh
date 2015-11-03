#!/usr/bin/env bash

# This script builds an ES5 npm package inside the `build` directory, ready to
# be pushed to npm.

set -eu
set -o pipefail
set +x

readonly ARGS="$@"
readonly LONGPROGNAME=$(perl -m'Cwd' -e 'print Cwd::abs_path(@ARGV[0])' "$0")
readonly PROGDIR="${LONGPROGNAME%/*}"     # get directory component (remove short match)
readonly PROGNAME="${LONGPROGNAME##*/}"   # get basename component (remove long match)

set -x

cd "$PROGDIR"/..

rm -rf build
mkdir build
mkdir build/dist
cp package.json README.md build/
cp dist/rmmv-mrp-core*.js build/dist/
node_modules/babel-cli/bin/babel.js src/module --out-dir build
