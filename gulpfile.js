var gulp = require('gulp'),
    browserify = require('browserify'),
  	watchify = require('watchify'),
  	source = require('vinyl-source-stream'),
  	path = require('path'),
  	babelify = require('babelify');
 

function compile( bundler, opts ) {
    var name = path.basename( opts.dest );
    var dir = path.dirname( opts.dest );
    return bundler.bundle()
        .on("error", function (err) {
            console.log(err.message);
            this.emit("end");
        })
        .pipe( source( name ) )
        .pipe( gulp.dest( dir ) );
}

function bundle( opts ){
  var bundler = watchify( browserify( { entries: [ opts.source ], debug: true } ) );

  bundler.transform({
    global: true
  }, 'uglifyify')

  bundler.on("update", function() { compile( bundler, opts ); } );
  compile( bundler, opts );
  return bundler;
}


gulp.task('build-js', function(){
	return gulp.src('src/js/*.js')
        .pipe(react())
        .pipe(gulp.dest('./dist'));

})

gulp.task('css', function(){
	return gulp.src('src/css/*.css')
		.pipe(gulp.dest('dist'));
})

gulp.task( "watch-js", ['css'], function () {
    return bundle( { source: "./src/js/datepicker.js", dest:"./dist/bundle.js" } );
});

gulp.task('default', ['watch-js'], function(){
	gulp.watch('src/**', ['css']);
});

