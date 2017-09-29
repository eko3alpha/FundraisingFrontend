var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var cssNano = require('gulp-cssnano');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var gulpIf = require('gulp-if');
var fileinclude = require('gulp-file-include');
var imagemin = require('gulp-imagemin');
var gulpsync = require('gulp-sync')(gulp);
var exec = require('child_process').exec;

var dirs = {
    src: 'src',
    dist: 'dist'
};

/* development tasks */

gulp.task('styles', function(){
  return gulp.src(dirs.src + '/sass/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
        outputStyle: 'nested', // libsass doesn't support expanded yet
        precision: 10,
        includePaths: ['.']}))
    .pipe(autoprefixer({
      browsers: [
        'last 2 versions',
        'android 4',
        'opera 12',
        'iOS >= 7'
      ]}
    ))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(dirs.src + '/css'))
    .pipe(browserSync.reload({
      stream: true
    }))
});

gulp.task('htmlincludes', function() {
  return gulp.src('./' + dirs.src + '/html/templates/*.html')
    .pipe(fileinclude({
      prefix: '@@',
      basepath: './' + dirs.src + '/html/partials'
    }))
    .pipe(gulp.dest('./' + dirs.src))
    .pipe(browserSync.reload({
      stream: true
    }))
});


gulp.task('scripts', function(cb) {
  exec('browserify src/app/main.js -s WMDE -o ' + dirs.src + '/build/wmde.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('scripts-prod', function(cb) {
  exec('browserify src/app/main.js -s WMDE -o ' + dirs.dist + '/build/wmde.js', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: dirs.src
    }
  })
});

gulp.task('watch',['browserSync'], function() {
  gulp.watch(dirs.src + '/sass/**/*.scss', ['styles'])
  gulp.watch(dirs.src + '/app/**/*.js', ['scripts', browserSync.reload])
  gulp.watch(dirs.src + '/html/partials/**/*.html', ['htmlincludes'])
  gulp.watch(dirs.src + '/html/templates/**/*.html', ['htmlincludes'])
  gulp.watch(dirs.src + '/scripts/**/*.js', browserSync.reload);
});


gulp.task('default', ['styles']);

/* todo copiar files jsf from node_modules to vendor */

gulp.task('develop', gulpsync.sync(['styles','scripts','htmlincludes']));

/* productions tasks */


// minimitzar js, css
// concatenar css
// copiar html
// minimitzar imatges


gulp.task('html', function(){
  return gulp.src(dirs.src + '/*.html')
    .pipe(gulp.dest(dirs.dist));
});


gulp.task('images', function() {
  return gulp.src(dirs.src + '/assets/images/**/*.{png,jpg,svg,ico}')
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.gifsicle({interlaced: true}),
      imagemin.svgo({plugins: [{removeUnknownsAndDefaults: false}, {cleanupIDs: false}]})
    ]))
    .pipe(gulp.dest(dirs.dist + '/assets/images'))
});

gulp.task('copies', function() {
  gulp.src(dirs.src + '/assets/fonts/**/*.{ttf,woff,eof,svg,eot,woff2}')
  .pipe(gulp.dest(dirs.dist + '/assets/fonts'));
  gulp.src(dirs.src + '/assets/favicons/*.*')
  .pipe(gulp.dest(dirs.dist + '/assets/favicons'));
  gulp.src(dirs.src + '/assets/pdf/*.pdf')
  .pipe(gulp.dest(dirs.dist + '/assets/pdf'));
  gulp.src(dirs.src + '/scripts/*.js')
    .pipe(gulp.dest(dirs.dist + '/scripts'));
});

gulp.task('useref', function(){
    return !gulp.src('!' + dirs.src + '/*.html')
        .pipe(useref())
        .pipe(gulpIf('*.js', uglify()))
        .pipe(gulpIf('*.css',cssNano()))
        .pipe(gulp.dest(dirs.dist))
});

/* tasca a cridar per posar tot el contingut a dist */
gulp.task('prod', gulpsync.sync(['scripts-prod','styles','htmlincludes','html','images','copies', 'useref']));
