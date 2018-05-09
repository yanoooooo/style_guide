var gulp            = require('gulp');
var sass            = require('gulp-sass');
var gulpFilter      = require("gulp-filter");
var less            = require('gulp-less');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var del             = require("del");
var runSequence     = require('run-sequence');

gulp.task("default", function() {
  //runSequence("js", "sass");
  runSequence("sass");
});

gulp.task('js', function(){
  browserify({
    entries: ['./public/js/common.js']
  })
  .bundle()
  .pipe(source('main.js'))
  .pipe(gulp.dest('./public/js/'));
});

// Sassコンパイルタスク
gulp.task('sass', function(){
  gulp.src('./public/sass/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./public/css/'));
});

// watchタスク(**/*.scss変更時に実行するタスク)
gulp.task('sass-watch', ['sass'], function(){
  var watcher = gulp.watch('./src/css/*.scss', ['sass']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});

/**
* cleanup task
*/
// gulp.task("clear-libs", function() {
//   del.sync("./public/lib");
// });

gulp.task("clear-css", function() {
  del.sync("./public/css");
});

gulp.task("clear-mod", function() {
  //del.sync("./bower_components");
  del.sync("./node_modules");
});
