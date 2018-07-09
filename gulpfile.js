var gulp = require('gulp'),
    path = require('path'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    compass = require('gulp-compass'),
    minifyCSS = require('gulp-clean-css'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(),
    nunjucksRender = require('gulp-nunjucks-render');
const del = require('del');

var DEST = 'build/';

gulp.task('layout', function () {
    nunjucksRender.nunjucks.configure(['app']);
    del(['public/*']);
    return gulp.src(['production/**/*.html', '!production/layout.html'])
        .pipe(nunjucksRender({
            path: ['production/'] // String or Array
        }))
        .pipe(gulp.dest('public'));
});

gulp.task('scripts', function () {
    return gulp.src([
        'src/js/helpers/*.js',
        'src/js/*.js'
    ])
        .pipe(concat('custom.js'))
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest(DEST + '/js'))
        .pipe(browserSync.stream());
});

// TODO: Maybe we can simplify how sass compile the minify and unminify version


gulp.task('compass', function (cb) {
    return gulp.src(['src/scss/*.scss'])
        .pipe(compass({
            config_file: path.join(__dirname, 'config.rb'),
            css: DEST + 'css',
            sass: 'src/scss'
        }))
        .pipe(autoprefixer('last 2 versions', '> 5%'))
        .pipe(gulp.dest(DEST + '/css'))
        .on('error', function (err) {
            cb(err)
        })
        .pipe(browserSync.stream());
});


gulp.task('css-minify', ['compass'], function () {
    return gulp.src([DEST + '/css/*.css', '!' + DEST + '/css/*.min.css'])
        .pipe(rename({suffix: '.min'}))
        .pipe(minifyCSS())
        .pipe(gulp.dest(DEST + '/css'))
        .pipe(browserSync.stream());
});

gulp.task('browser-sync', ['layout'], function () {
    browserSync.init({
        server: {
            baseDir: './'
        },
        startPath: './public/index.html'
    });
    gulp.watch('src/js/*.js', ['scripts']);
    // Watch .scss files
    gulp.watch('src/scss/*.scss', ['compass', 'css-minify']);
});

gulp.task('watch', ['layout','scripts', 'css-minify'], function () {
    // Watch .html files
    gulp.watch('production/*.html', ['layout', browserSync.reload]);
    // Watch .js files
    gulp.watch('src/js/*.js', ['scripts']);
    // Watch .scss files
    gulp.watch('src/scss/*.scss', ['compass', 'css-minify']);
});
// Default Task
gulp.task('default', ['layout', 'browser-sync', 'watch']);
