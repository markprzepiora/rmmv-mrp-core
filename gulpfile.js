var gulp        = require('gulp');
var uglify      = require('gulp-uglify');
var rename      = require('gulp-rename');
var browserify  = require('browserify');
var babelify    = require('babelify');
var watchify    = require('watchify');
var source      = require('vinyl-source-stream');
var browserSync = require('browser-sync');

var files = [
  {
    input: ['./src/mrp-core-global.js'],
    output: 'rmmv-mrp-core.js',
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

  if (global.isWatching) {
    var bundler = watchify(browserify(opts));
  } else {
    var bundler = browserify(opts);
  }
  bundler = bundler.transform(babelify);

  var rebundle = function() {
    var startTime = new Date().getTime();

    return bundler
      .bundle()
      .on('error', function() {
        return console.log(arguments);
      })
      .pipe(source(options.output))
      .pipe(gulp.dest(options.destination))
      .pipe(browserSync.reload({ stream: true }))
      .on('end', function() {
        var time = (new Date().getTime() - startTime) / 1000;
        return console.log(
          options.output.cyan + " was browserified: " + (time + 's').magenta);
      })
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
