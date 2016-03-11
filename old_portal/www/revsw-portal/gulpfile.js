'use strict';

var gulp = require('gulp');
var less = require('gulp-less');
var path = require('path');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpif = require('gulp-if');
var vulcanize = require('gulp-vulcanize');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var ngAnnotate = require('gulp-ng-annotate');

var devFolder = 'dev/';
var destFolder = './';

gulp.task('less', function () {
  return gulp.src(devFolder + 'less/styles.less')
    .pipe(less({
      paths: [ path.join(__dirname, 'less') ]
    }))
    .pipe(gulp.dest(devFolder + 'css'));
});

gulp.task('copyCss', function () {
  return gulp.src(devFolder + 'css/**/*.css')
    .pipe(gulp.dest(destFolder + 'css'));
});

gulp.task('copyImages', function () {
  return gulp.src(devFolder + 'images/**/*')
    .pipe(gulp.dest(destFolder + 'images'));
});

gulp.task('copyParts', function () {
  return gulp.src(devFolder + 'parts/**/*.html')
    .pipe(gulp.dest(destFolder + 'parts'));
});

gulp.task('copyJson', function () {
  return gulp.src(devFolder + 'js/**/*.json')
    .pipe(gulp.dest(destFolder + 'js'));
});

gulp.task('vulcanize', function () {
  return gulp.src(devFolder + 'polymer/elements.html')
    .pipe(vulcanize({
      stripExcludes: false,
      stripComments: true,
      inlineScripts: true,
      inlineCss: true
    }))
    .pipe(gulp.dest(destFolder + 'polymer/'));
});

gulp.task('dist', function () {
  var assets = useref.assets();

  var uglifyOptions = {
    mangle: false//,
    //compress: {
    //  dead_code: false,
    //  hoist_funs: false
    //}
  };
  return gulp.src(devFolder + 'index.html')
    .pipe(assets)
    .pipe(gulpif('*.js', ngAnnotate()))
    .pipe(gulpif('*.js', uglify(uglifyOptions)))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(gulp.dest(destFolder));
});

gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: "./dev",
      routes: {
        '/bower_components': 'bower_components',
        '/portal' : '/'
      }
    }
  });

  gulp.watch([devFolder + '**/*.html'], reload);
  gulp.watch([devFolder + 'less/*.less'], ['less', reload]);
  gulp.watch([devFolder + 'polymer/**/*.html', '!./polymer/dist/*'], ['vulcanize', reload]);
  gulp.watch([devFolder + 'js/**/*.js'], reload);
  gulp.watch([devFolder + 'js/**/*.html'], reload);
  gulp.watch([devFolder + 'images/**/*'], reload);
});

gulp.task('copy', ['copyCss', 'copyParts', 'copyImages', 'copyJson']);
gulp.task('build', ['copy', 'dist', 'vulcanize']);
gulp.task('default', ['serve', 'less']);
