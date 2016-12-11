var gulp = require('gulp');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

gulp.task('js', function() {
    browserify({
            entries: ['html/js/main.js']
        })
        .bundle()
        .pipe(source('build.js'))
        .pipe(gulp.dest('html/build/'));
});