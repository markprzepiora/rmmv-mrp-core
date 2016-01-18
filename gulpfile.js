var gulp        = require('gulp');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var browserify  = require('browserify');
var babelify    = require('babelify');
var watchify    = require('watchify');
var source      = require('vinyl-source-stream');
var browserSync = require('browser-sync');
var colors      = require('colors');

var files = [
  {
    input: ['./src/global.js'],
    output: 'rmmv-mrp-core.js',
    extensions: ['.js'],
    destination: './dist'
  }, {
    input: ['./src/global-map-exporter.js'],
    output: 'rmmv-mrp-core--map-exporter.js',
    extensions: ['.js'],
    destination: './dist'
  }, {
    input: ['./src/global-option-parser.js'],
    output: 'rmmv-mrp-core--option-parser.js',
    extensions: ['.js'],
    destination: './dist'
  }, {
    input: ['./src/global-osx-fixes.js'],
    output: 'rmmv-mrp-core--osx-fixes.js',
    extensions: ['.js'],
    destination: './dist'
  }, {
    input: ['./src/global-map.js'],
    output: 'rmmv-mrp-core--map.js',
    extensions: ['.js'],
    destination: './dist'
  }, {
    input: ['./src/global-change-text-speed.js'],
    output: 'rmmv-mrp-core--change-text-speed.js',
    extensions: ['.js'],
    destination: './dist'
  }, {
    input: ['./test/index.js'],
    output: 'test.js',
    extensions: ['.js'],
    destination: './dist'
  }
];

var createBundle = function(options, callback) {
  var bundleMethod = global.isWatching ? watchify : browserify;
  var opts = {
    entries: options.input,
    extensions: options.extensions,
    packageCache: {},
    cache: {}
  };

  var bundler = browserify(opts)
    .exclude('nw.gui')
    .exclude('os')
    .exclude('fs')
    .exclude('path')
    .exclude('buffer')
    .exclude('process')
    .transform("babelify");

  if (global.isWatching) {
    bundler = watchify(bundler);
  }

  var rebundle = function() {
    var startTime = new Date().getTime();

    return bundler
      .bundle()
      .on('error', function() {
        return console.log(arguments);
      })
      .pipe(source(options.output))
      .pipe(gulp.dest(options.destination))
      .on('end', function() {
        var time = (new Date().getTime() - startTime) / 1000;
        return console.log(
          options.output.cyan + " was browserified: " + (time + 's').magenta);
      })
      .pipe(browserSync.reload({ stream: true }))
  };
  if (global.isWatching) {
    bundler.on('update', rebundle);
  }
  return rebundle();
};

var createBundles = function(bundles) {
  return bundles.forEach(function(bundle) {
    return createBundle({
      input:       bundle.input,
      output:      bundle.output,
      extensions:  bundle.extensions,
      destination: bundle.destination,
      debug:       true
    });
  });
};

gulp.task('browserify', function() {
  return createBundles(files);
});

gulp.task('setWatch', function() {
  global.isWatching = true;
});

gulp.task('watch', ['setWatch', 'browserify'], function() {
  browserSync({
    server: {
      baseDir: './'
    }
  });
});

gulp.task('minify', ['browserify'], function() {
  return gulp.src('./dist/rmmv-mrp-core.js')
    .pipe(uglify())
    .pipe(rename('rmmv-mrp-core.min.js'))
    .pipe(gulp.dest('./dist'))
});
