'use strict';
const gulp = require('gulp');
const server = require('browser-sync');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

// Styles
// ------------------------------
gulp.task('style', () => {
  gulp.src('src/css/app.css')
    .pipe(postcss([ autoprefixer() ]))
    .pipe(gulp.dest('./css'));
});

gulp.task('serve', ['style'], () => {
  server.init({
    server: '.',
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch('src/css/**/*.css', ['style']).on('change', server.reload);
  gulp.watch(['js/**/*.js', 'css/**/*.css', '*.html']).on('change', server.reload);
});
