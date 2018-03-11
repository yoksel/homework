'use strict';
const gulp = require('gulp');
const server = require('browser-sync');;

gulp.task('serve', () => {
  server.init({
    server: '.',
    notify: false,
    open: true,
    ui: false
  });

  gulp.watch(['js/**/*.js', 'css/**/*.css', '*.html']).on('change', server.reload);

});
