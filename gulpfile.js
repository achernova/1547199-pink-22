const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("postcss-csso");
const rename = require("gulp-rename");
const htmlmin = require("gulp-htmlmin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const sync = require("browser-sync").create();

const html = () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin())
    .pipe(gulp.dest("build"))
}

const styles = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(gulp.dest("build/css"))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(sourcemap.write("."))
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(gulp.dest("build/img"))
}

const createWebp = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("build/img"))
}

const sprite = () => {
  return gulp.src("source/img/*.{svg}")
    .pipe(svgstore())
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.sprite = sprite;

const copy = () => {
  return gulp.src([
      "source/fonts/*.{woff2,woff}",
      "source/img/**/*.{jpg,png,svg}",
      "source/js/*.js"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
}

const clean = () => {
  return del("dist");
}

exports.clean = clean;

const serve = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });

  gulp.watch("source/less/**/*.less", gulp.series(styles));
  gulp.watch("source/*.html").on("change", sync.reload);

  done();
}

const build = gulp.series(
  clean,
  gulp.parallel(
    styles,
    html,
    copy,
    sprite,
    images,
    createWebp
  )
)

exports.build = build;
exports.default = gulp.series(build, serve)
