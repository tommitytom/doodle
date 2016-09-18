const gulp = require('gulp');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const rm = require('gulp-rimraf');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const htmlreplace = require('gulp-html-replace');
const htmlmin = require('gulp-htmlmin');
const cleanCSS = require('gulp-clean-css');
const minimist = require('minimist');
const sftp = require('gulp-sftp');

const args = minimist(process.argv.slice(2));

const paths = {
	scripts: ['./src/**/*.js']
};

function compile() {
	return gulp.src(paths.scripts, { base: './src' })
		//.pipe(sourcemaps.init())
		.pipe(babel())
		//.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./build/intermediate'));
}

function lint() {
	return gulp.src(paths.scripts)
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

function browserifyCode() {
	var stream = browserify({
		entries: './build/intermediate/Browser.js',
	})
	.bundle();

	return stream.pipe(source('doodle.js'))
		.pipe(gulp.dest('./build'));
}

function minifyJs() {
	return gulp.src('./build/doodle.js')
		.pipe(uglify())
		.pipe(rename({ extname: '.min.js' }))
		.pipe(gulp.dest('./build'));
}

function minifyCss() {
	return gulp.src('./src/doodle.css')
		.pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(rename({ extname: '.min.css' }))
		.pipe(gulp.dest('./build'));
};

gulp.task('compile', compile);
gulp.task('browserify', ['compile'], browserifyCode);
gulp.task('minify-js', ['browserify'], minifyJs);
gulp.task('minify-css', ['browserify'], minifyCss);
gulp.task('build', ['compile', 'browserify']);
gulp.task('dist', ['minify-js', 'minify-css'], function() {
	return gulp.src('./src/index.html')
		.pipe(htmlreplace({
			cssInline: {
				src: gulp.src('./build/doodle.min.css'),
				tpl: '<style>%s</style>'
			},
			jsInline: {
				src: gulp.src('./build/doodle.min.js'),
				tpl: '<script type="text/javascript">%s</script>'
			}
		}))
		.pipe(htmlmin({ collapseWhitespace: true }))    	
		.pipe(gulp.dest('./dist/'));
});

gulp.task('upload', function() {
	return gulp.src('dist/index.html')
		.pipe(sftp({
			host: args.host,
			user: args.user,
			pass: args.pass,
			remotePath: args.remote
		}));
});

gulp.task('vet', lint);
gulp.task('watch', ['build'], () => { gulp.watch(paths.scripts, ['build']); });
gulp.task('default', ['build']);