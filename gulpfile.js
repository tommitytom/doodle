'use strict';

var gulp        = require('gulp'),
	sourcemaps  = require('gulp-sourcemaps'),
	rename      = require('gulp-rename'),
	babel       = require('gulp-babel'),
	uglify      = require('gulp-uglify'),
	rm          = require('gulp-rimraf'),
	changed     = require('gulp-changed'),
	browserify  = require('browserify'),
	source      = require('vinyl-source-stream');	

gulp.task('default', ['clean', 'compile']);
gulp.task('browser', ['browserify']);
gulp.task('deploy', ['browserify', 'minify']);

gulp.task('clean', function() {
	return gulp.src('src/*').pipe(rm());
});

gulp.task('compile', ['clean'], function() {
	return gulp.src('dev/*.js')
		.pipe(sourcemaps.init())
		.pipe(babel({presets: ['es2015']}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('./src'));
});

gulp.task('browserify', ['default'], function() {
	var stream = browserify({
		entries: 'src/Browser.js',
	})
	.bundle();

	return stream.pipe(source('doodle-latest.js'))
		.pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['browserify'], function() {
	return gulp.src('dist/doodle-latest.js')
	  .pipe(uglify())
	  .pipe(rename({ extname: '.min.js' }))
	  .pipe(gulp.dest('./dist'));
});