const gulp = require('gulp');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');

gulp.task('images-opt', function () {
    gulp.src('img/*.*')
        .pipe(imagemin({
          progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest('img'));
});


gulp.task('default', ['images-opt'], function(){});
