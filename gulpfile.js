var gulp = require('gulp');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-csso');
var concat = require('gulp-concat');
var minifyJS = require('gulp-minify');


gulp.task('copy-images', function () {
	return gulp.src(['source/img/*.{gif,jpg,png,svg}'])
		.pipe(gulp.dest('public/img'));
});

gulp.task('copy-fonts', function () {
	return gulp.src(['source/fonts/*.{otf,woff}'])
		.pipe(gulp.dest('public/fonts'));
});

gulp.task('css', function () {
	return gulp.src('source/scss/main.scss')
		.pipe(sass())
		.pipe(minifyCSS())
		.pipe(gulp.dest('public/css'));
});

gulp.task('js', function () {
	return gulp.src(['source/js/libs/*.js', 'source/js/*.js'])
		.pipe(minifyJS({ ext: { min: '.min.js' }, exclude: ['libs'], noSource: true }))
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest('public/js'));
});

gulp.task('default', ['js', 'css', 'copy-images', 'copy-fonts']);