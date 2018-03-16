'use strict';
const gulp = require('gulp');
const server = require('browser-sync');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const sequence = require('run-sequence');
const rimraf = require('rimraf');
const babel = require('gulp-babel');
const ghPages = require('gulp-gh-pages');

// Js
// ------------------------------
gulp.task('js', () => {
  gulp.src([
    'src/**/data.js',
    'src/**/common.js'
  ])
  .pipe(sourcemaps.init())
  .pipe(concat('common.js'))
  .pipe(babel())
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('./assets/js'));
});

// Styles
// ------------------------------
gulp.task('style', () => {
  gulp.src('src/scss/styles.scss')
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulp.dest('./assets/css'));
});

// Images
// ------------------------------
gulp.task('images', () => {
  gulp.src('src/img/*.*')
    .pipe(imagemin({
      optimizationLevel: 7
    }))
    .pipe(gulp.dest('./assets/img'));
});

// Copy
// ------------------------------
gulp.task('copy:dev', () => {
  gulp.src('src/preview/*.*')
    .pipe(gulp.dest('./preview'));
  gulp.src('src/img/*.*')
    .pipe(gulp.dest('./assets/img'));
  gulp.src('src/fonts/*')
    .pipe(gulp.dest('./assets/fonts'));
  gulp.src('src/*.html')
    .pipe(gulp.dest('.'));
});

gulp.task('copy:deploy', () => {
  gulp.src('src/fonts/*')
    .pipe(gulp.dest('./assets/fonts'));
  gulp.src('src/*.html')
    .pipe(gulp.dest('.'));
});

// Build
// ------------------------------
gulp.task('clean', function (done) {
  rimraf('./assets', done);
});

gulp.task('build:dev', function (done) {
  sequence(
    'clean',
    'style',
    'js',
    'copy:dev',
    done
  );
});

gulp.task('build:deploy', function (done) {
  sequence(
    'clean',
    'style',
    'js',
    'images',
    'copy:deploy',
    done
  );
});

gulp.task('serve', () => {
  server.init({
    server: '.',
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch('src/js/**/*.js', ['js']).on('change', server.reload);
  gulp.watch('src/scss/**/*.scss', ['style']).on('change', server.reload);
  gulp.watch('src/img/*.*', ['images']).on('change', server.reload);
  gulp.watch('src/**/*.html', ['copy:dev']).on('change', server.reload);
});
