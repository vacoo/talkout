var gulp      = require('gulp');
var minifyCss = require('gulp-minify-css');
var rename    = require('gulp-rename');
var sass      = require('gulp-sass');
var uglify    = require('gulp-uglify');
var concat    = require('gulp-concat');
var run       = require('gulp-run');
var $         = require('gulp-load-plugins')();

var iconfont = require('gulp-iconfont');
var async = require('async');
var consolidate = require('gulp-consolidate');
var svgmin = require('gulp-svgmin');
var replace = require('gulp-replace');

var dir = "assets/"; // Рабочая директория
var modulesDir = 'node_modules/'; // Папка с модулями


// ----------------- sass -> css -> css minify
gulp.task('sass', function(){
    return gulp.src(dir + 'css/app.scss')

      .pipe(sass().on('error', sass.logError))
      .pipe(gulp.dest(dir + 'css'))

      .pipe(minifyCss())
      .pipe(rename({
          suffix: ".min",
      }))
      .pipe(gulp.dest(dir + 'css'));
});


// ----------------- JS
var jsPatch = [
];

gulp.task('js', function(){
    return gulp.src(jsPatch)

        .pipe(concat('app.js'))
        .pipe(gulp.dest(dir + "js"))

        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(dir + "js/"));
});


// ----------------- Создание шрифта из иконок
gulp.task('glyph', function () {
  return gulp.src('fontello-config.json')
    .pipe($.fontello({
      host          :         'http://fontello.com',
      font          :         'fonts2',
      css           :         'css/fonts',
      assetsOnly    :         true
    }))
    .pipe(gulp.dest(dir))
});

// Скачивание иконок определенных в font-config.json
gulp.task('buildIcons', function() {
    var script = "./" + modulesDir + "fontello-cli/bin/fontello-cli";
    var config = "./" + dir + "fonts/fonts-config.json";
    var css    = "./" + dir + "css/fonts";
    var fonts  = "./" + dir + "fonts";

    run(script + ' install --config ' + config + ' --css ' + css  + ' --font ' + fonts).exec('', function() {
      console.log('done!');
    });
});

// Генерация шрифта из svg
var fontName = 'icons';
gulp.task('Svgmin', function () {
    return gulp.src(dir + 'images/icons/*.svg')
        .pipe(svgmin({
            plugins: [
                { removeDimensions: true },
                { cleanupListOfValues: true },
                { cleanupNumericValues: true }
            ]
        }))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace(/\ /g, "")
        }))
        .pipe(gulp.dest(dir + 'images/icons-opt/'));
});
gulp.task('Iconfont', function (done) {
    var iconStream = gulp.src([dir + 'images/icons-opt/*.svg'])
        .pipe(iconfont({
            fontName: fontName,
            formats: ['ttf', 'eot', 'woff', 'svg', 'woff2'],
            fixedWidth: true,
            centerHorizontally: true,
        }));
    async.parallel([
        function handleGlyphs(cb) {
            iconStream.on('glyphs', function (glyphs, options) {
                gulp.src(dir + 'css/base/template/icons.css')
                    .pipe(consolidate('lodash', {
                        glyphs: glyphs,
                        fontName: fontName,
                        fontPath: '../../fonts/',
                        className: fontName,

                    }))
                    .pipe(replace('../../fonts', '../../assets/fonts'))
                    .pipe(gulp.dest(dir + 'css/base'))
                    .on('finish', cb);
            });
        },
        function handleFonts(cb) {
            iconStream
                .pipe(gulp.dest(dir + 'fonts'))
                .on('finish', cb);
        }
    ], done);
});

// ----------------- Слежение за изменениями в файлах
gulp.watch([dir + 'css/*/*.scss'], ['sass']);
gulp.watch([dir + 'js/src/*.js'], ['js']);

// ----------------- Задача по умолчанию
gulp.task('default', ['sass', 'js']);
gulp.task('svg', ['Svgmin', 'Iconfont']);
