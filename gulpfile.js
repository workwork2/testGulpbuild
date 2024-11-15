const gulp = require('gulp');
const less = require('gulp-less');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const gulpug = require('gulp-pug');
const newer = require('gulp-newer');
const browsersync = require('browser-sync').create();
const del = require('del');

const paths = {
    pug: {
        src: './*.pug',
        dest: 'dist/'
    },
    html: {
        src: './*.html',
        dest: 'dist/'
    },
    styles: {
        src: 'src/styles/**/*.less',
        dest: 'dist/css'
    }, 
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'dist/js'
    },
    images: {
        src: 'src/img/**/*',
        dest: 'dist/images'
    }
}

function clean() {
    return del(['dist/*', '!dist/img']);
}
function pug() {
   
    return gulp.src(paths.pug.src)
        .pipe(pug())
        .pipe(size({
            showFiles:true
        }))
        .pipe(gulp.dest(paths.pug.dest))
        .pipe(browsersync.stream());
}

async function html() {
    const htmlmin = (await import('gulp-htmlmin')).default; // Динамический импорт
    return gulp.src(paths.html.src)
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(size())
        .pipe(gulp.dest(paths.html.dest))
        .pipe(browsersync.stream());
}

async function styles() {
    const autoprefixer = (await import('gulp-autoprefixer')).default; // Динамический импорт
    return gulp.src(paths.styles.src)
        .pipe(sourcemaps.init())
        .pipe(less())
        .pipe(autoprefixer({
            cascade: false
        }))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(rename({
            basename: 'main',
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.styles.dest))
        .pipe(browsersync.stream()); // Исправлено
}

async function scripts() {
    return gulp.src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']  
        }))
        .pipe(uglify())
        .pipe(concat('main.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(size())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(browsersync.stream()); // Исправлено
}

async function img() {
    const imagemin = (await import('gulp-imagemin')).default; // Динамический импорт

    return gulp.src(paths.images.src)
        .pipe(newer(paths.images.dest))
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(size())
        .pipe(gulp.dest(paths.images.dest));
}

function watch() {
    browsersync.init({
        server: {
            baseDir: "./"
        }
    });
    gulp.watch(paths.html.src, html);
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.scripts.src, scripts);
    gulp.watch(paths.images.src, img);
}

const build = gulp.series(clean, gulp.parallel(html, styles, scripts, img), watch);

exports.clean = clean;
exports.img = img;
exports.pug = pug;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.watch = watch;
exports.build = build;
exports.default = build;
