const gulp = require("gulp");
const mode = require("gulp-mode")({
  modes: ["production", "development"],
  default: "development",
  verbose: false,
});

const sass = require("gulp-sass")(require("sass"));
const sassGlob = require("gulp-sass-glob-use-forward");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
const mergeMq = require("gulp-merge-media-queries");

const browserSync = require("browser-sync");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");

const cleanCss = require("gulp-clean-css");
const uglify = require("gulp-uglify");
const del = require("del");

const gulpEslint = require("gulp-eslint");
const gulpBabel = require("gulp-babel");
const gulpStylelint = require("gulp-stylelint");

const imageMin = require("gulp-imagemin");
const pngquant = require("imagemin-pngquant");

const Src_Path = {
  scss: "./src/assets/scss/**/*.scss",
  js: "./src/assets/js/**/*.js",
  images: "./src/assets/images/**",
};

const Dist_Path = {
  root: "../",
  assets: "../assets/",
  css: "../assets/css/",
  wpCss: "../style.css",
  js: "../assets/js/",
  images: "../assets/images/",
  php: "../**/*.php",
};

const LocalDomain = "http://gulpdemo.local";

const compileSass = done => {
  gulp
    .src(Src_Path.scss, { sourcemaps: true })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(gulpStylelint({ reporters: [{ formatter: "string", console: true }] }))
    .pipe(sassGlob())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssSorter()]))
    .pipe(mergeMq())
    .pipe(mode.development(gulp.dest(Dist_Path.css, { sourcemaps: "./sourcemaps" })))
    .pipe(mode.production(cleanCss()))
    .pipe(mode.production(gulp.dest(Dist_Path.css)));
  done();
};

const minJs = done => {
  gulp
    .src(Src_Path.js, { sourcemaps: true })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(gulpEslint({ useEslintrc: true }))
    .pipe(gulpEslint.format())
    .pipe(gulpEslint.failOnError())
    .pipe(
      gulpBabel({
        presets: ["@babel/preset-env"],
      })
    )
    .pipe(mode.development(gulp.dest(Dist_Path.js, { sourcemaps: "./sourcemaps" })))
    .pipe(mode.production(uglify()))
    .pipe(mode.production(gulp.dest(Dist_Path.js)));
  done();
};

const minImages = done => {
  gulp
    .src(Src_Path.images, {
      since: gulp.lastRun(minImages),
    })
    .pipe(
      plumber({
        errorHandler: notify.onError({
          message: "Error: <%= error.message %>",
        }),
      })
    )
    .pipe(
      imageMin([
        imageMin.mozjpeg({ quality: 80 }),
        imageMin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
        imageMin.gifsicle({ optimizationLevel: 3 }),
        pngquant({
          quality: [0.65, 0.8],
          speed: 1,
        }),
      ])
    )
    .pipe(gulp.dest(Dist_Path.images));
  done();
};

const clean = done => {
  del(Dist_Path.assets, { force: true });
  done();
};

const browserInit = done => {
  browserSync.init({
    notify: false,
    proxy: LocalDomain,
  });
  done();
};

const browserReload = done => {
  browserSync.reload();
  done();
};

const watch = done => {
  gulp.watch(Src_Path.scss, { delay: 200 }, gulp.series(compileSass, browserReload));
  gulp.watch(Src_Path.js, { delay: 200 }, gulp.series(minJs, browserReload));
  gulp.watch(Dist_Path.php, { delay: 200 }, browserReload);
  gulp.watch(Dist_Path.wpCss, { delay: 200 }, browserReload);
  gulp.watch(Src_Path.images, { delay: 200 }, minImages);
  done();
};

exports.compileSass = compileSass;
exports.minJs = minJs;
exports.minImages = minImages;
exports.clean = clean;
exports.watch = watch;

exports.browserInit = browserInit;

exports.start = gulp.parallel(browserInit, watch);
exports.dev = gulp.parallel(compileSass, minJs, minImages);
exports.build = gulp.parallel(compileSass, minJs, minImages);
