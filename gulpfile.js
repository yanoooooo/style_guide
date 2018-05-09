var gulp            = require('gulp');
var sass            = require('gulp-sass');
var gulpFilter      = require("gulp-filter");
//var mainBowerFiles  = require("main-bower-files");
var less            = require('gulp-less');
//var bower           = require("bower");
var del             = require("del");
var runSequence     = require('run-sequence');

gulp.task("default", function() {
  //runSequence("bower", "sass");
  runSequence("sass");
});

//bower install
gulp.task("bower", ["bower-install"], function() {
  var jsFilter = gulpFilter("**/*.js", {
    restore: true
  });
  var fontsFilter = gulpFilter("**/fonts/*", {
    restore: true
  });
  var imgFilter = gulpFilter("**/images/*", {
    restore: true
  });
  var mapFilter = gulpFilter("**/*.css.map", {
    restore: true
  });
  var cssFilter = gulpFilter("**/*.css", {
    restore: true
  });
  var lessFilter = gulpFilter("**/*.less", {
    restore: true
  });

  //console.log(mainBowerFiles());
  gulp.src(mainBowerFiles())
    .pipe(jsFilter)
    .pipe(gulp.dest("./public/lib/js"))
    .pipe(jsFilter.restore)
    .pipe(fontsFilter)
    .pipe(gulp.dest("./public/lib/fonts"))
    .pipe(fontsFilter.restore)
    .pipe(imgFilter)
    .pipe(gulp.dest("./public/lib/images"))
    .pipe(imgFilter.restore)
    .pipe(mapFilter)
    .pipe(gulp.dest("./public/lib/css"))
    .pipe(mapFilter.restore)
    .pipe(cssFilter)
    .pipe(gulp.dest("./public/lib/css"))
    .pipe(cssFilter.restore)
    .pipe(lessFilter)
    .pipe(less())
    .pipe(gulp.dest("./public/lib/css"))
    .pipe(lessFilter.restore);
});

gulp.task("bower-install", ["clear-libs"], function(callback) {
  bower.commands.install().on('end', function() {
    callback();
  });
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
gulp.task("clear-libs", function() {
  del.sync("./public/lib");
});

gulp.task("clear-css", function() {
  del.sync("./public/css");
});

gulp.task("clear-mod", function() {
  del.sync("./bower_components");
  del.sync("./node_modules");
});
