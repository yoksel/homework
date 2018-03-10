'use strict';
const gulp = require('gulp');
const server = require('browser-sync');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const postcss = require('gulp-postcss');
const csso = require('gulp-csso');
const rename = require('gulp-rename');
const autoprefixer = require('autoprefixer');
const imagemin = require('gulp-imagemin');
const concat = require('gulp-concat');
const sequence = require('run-sequence');
const rimraf = require('rimraf');
const babel = require('gulp-babel');
const ghPages = require('gulp-gh-pages');

gulp.task('clean', function (done) {
  rimraf('./build', done);
});

gulp.task('js', () => {
  gulp.src([
    'src/**/data.js'
  ])
    .pipe(gulp.dest('./build/assets'));

  gulp.src([
    'src/**/*.js', '!src/**/data.js'
  ])
    .pipe(concat('common.js'))
    // .pipe(babel())
    .pipe(gulp.dest('./build/assets/js'));
});

gulp.task('style', () => {
  gulp.src('src/scss/styles.scss')
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulp.dest('./build/assets/css'))
    .pipe(csso())
    .pipe(rename('styles.min.css'))
    .pipe(gulp.dest('./build/assets/css'));
});

gulp.task('images', () => {
  gulp.src('src/img/*.*')
    .pipe(imagemin({
      optimizationLevel: 7
    }))
    .pipe(gulp.dest('./build/assets/img'));
});

gulp.task('copy:dev', () => {
  gulp.src('src/preview/*.*')
    .pipe(gulp.dest('./build/preview'));
  gulp.src('src/img/*.*')
    .pipe(gulp.dest('./build/assets/img'));
  gulp.src('src/*.html')
    .pipe(gulp.dest('./build'));
  gulp.src('src/fonts/*')
    .pipe(gulp.dest('./build/assets/fonts'));
});

gulp.task('copy:deploy', () => {
  gulp.src('src/*.html')
    .pipe(gulp.dest('./build'));
  gulp.src('src/fonts/*')
    .pipe(gulp.dest('./build/assets/fonts'));
});

gulp.task('fonts', () => {
  gulp.src('src/fonts/*')
    .pipe(gulp.dest('./build/assets/fonts'));
});

gulp.task('html', () => {
  gulp.src('src/*.html')
    .pipe(gulp.dest('./build'));
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

gulp.task('deploy', function() {
  return gulp.src('build/**/*')
    .pipe(ghPages());
});

gulp.task('serve', () => {
  server.init({
    server: './build',
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch('src/js/**/*.js', ['js']).on('change', server.reload);
  gulp.watch('src/scss/**/*.scss', ['style']).on('change', server.reload);
  gulp.watch('src/img/*.*', ['images']).on('change', server.reload);
  gulp.watch('src/**/*.html', ['html']).on('change', server.reload);
});
