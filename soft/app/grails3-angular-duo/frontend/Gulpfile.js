'use strict';

var gulp = require('gulp');
require('gulp-stats')(gulp);

var connect = require('gulp-connect');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var wiredep = require('wiredep').stream;
var gulpif = require('gulp-if');
var minifyCss = require('gulp-minify-css');
var useref = require('gulp-useref');
var uglify = require('gulp-uglify');
var modRewrite = require('connect-modrewrite');
var sourcemaps = require('gulp-sourcemaps');
var less = require('gulp-less');
var del = require('del');
var imagemin = require('gulp-imagemin');
var rename = require('gulp-rename');
var htmlmin = require('gulp-htmlmin');
var karma = require('gulp-karma');
var openUrl = require('gulp-open');
var autoprefixer = require('gulp-autoprefixer');
var ngAnnotate = require('gulp-ng-annotate');
var size = require('gulp-size');

var appConfig = {
  app: require('./bower.json').appPath || 'app',
  temp: '.tmp',
  dist: '../backend/src/main/webapp/frontend',
  // dist: 'dist',
  hostname: 'localhost',
  port: 9000,
  rewriteRule: '/(.*)$ http://localhost:8080/duo/frontend/$1 [P]'
};

appConfig.url = 'http://' + appConfig.hostname + ':' + appConfig.port;

var karmaConfig = {
  unit: {
    configFile: './test/karma.conf.js',
  }
};

gulp.task('server:dev', function() {
  connect.server({
    root: appConfig.app,
    hostname: appConfig.hostname,
    port: appConfig.port,
    livereload: true,
    middleware: function(connect) {
      var middlewares = [
        connect.static('.tmp'),
        connect().use(
          '/bower_components',
          connect.static('./bower_components')
        ),
        connect().use(
          '/app/styles',
          connect.static('./app/styles')
        ),
        connect.static(appConfig.app)
      ];
      middlewares.push(modRewrite([appConfig.rewriteRule]));
      return middlewares;
    }
  });
});

gulp.task('jshint', function() {
  return gulp.src(appConfig.app + '/scripts/**/*.js')
    .pipe(jshint('.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('html', function() {
  return gulp.src(appConfig.app + '/views/**/*.html')
    .pipe(connect.reload());
});

gulp.task('wiredep', function() {
  return gulp.src(appConfig.app + '/index.html')
    .pipe(wiredep({
      ignorePath: /\.\.\//,
      directory: './bower_components'
    }))
    .pipe(gulp.dest(appConfig.app));
});

gulp.task('less', function() {
  return gulp.src(appConfig.app + '/styles/main.less')
    .pipe(less())
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(gulp.dest(appConfig.temp + '/styles'))
    .pipe(connect.reload());
});

gulp.task('compress', ['less'], function() {
  return gulp.src(appConfig.app + '/index.html')
    .pipe(useref.assets())
    .pipe(gulpif('*.js', uglify({
      mangle: false
    })))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(gulp.dest(appConfig.dist));
});

gulp.task('htmlmin', function() {
  return gulp.src(appConfig.app + '/views/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      conservativeCollapse: true,
      collapseBooleanAttributes: true,
      removeCommentsFromCDATA: true,
      removeOptionalTags: true
    }))
    .pipe(gulp.dest(appConfig.dist + '/views'));
});

gulp.task('clean', function(cb) {
  del([appConfig.temp + '/', appConfig.dist + '/'], {
    force: true
  }, cb);
});

gulp.task('openUrl', function() {
  var options = {
    url: appConfig.url
  };
  return gulp.src(appConfig.app + '/index.html')
    .pipe(openUrl('', options));
});

gulp.task('copy:resources', function() {
  gulp.src(appConfig.app + '/index.html')
    .pipe(useref())
    .pipe(gulp.dest(appConfig.dist));
  gulp.src('bower_components/bootstrap/dist/fonts/*')
    .pipe(gulp.dest(appConfig.dist + '/fonts'));
  gulp.src('bower_components/font-awesome/fonts/*')
    .pipe(gulp.dest(appConfig.dist + '/fonts'));
  gulp.src(appConfig.app + '/fonts/*')
    .pipe(gulp.dest(appConfig.dist + '/fonts'));
});

gulp.task('imagemin', function() {
  gulp.src(appConfig.app + '/images/**.{png,jpg,jpeg,gif}')
    .pipe(imagemin({
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(appConfig.dist + '/images'));
  gulp.src(appConfig.app + '/styles/patterns/**.{png,jpg,jpeg,gif}')
    .pipe(imagemin({
      optimizationLevel: 5
    }))
    .pipe(gulp.dest(appConfig.dist + '/styles/patterns'));
});

gulp.task('watch', function() {
  gulp.watch([appConfig.app + '/**/*.html'], ['html']);
  gulp.watch([appConfig.app + '/styles/main.less'], ['less']);
  gulp.watch([appConfig.app + '/scripts/**/*.js', './Gulpfile.js'], []);
  gulp.watch(['./bower.json'], ['wiredep']);
});

gulp.task('serve', ['less', 'watch', 'server:dev', 'wiredep'], function() {
  gulp.start('openUrl');
});

gulp.task('build', ['compress', 'copy:resources', 'htmlmin'], function() {
  return gulp.src(appConfig.dist + '/**/*').pipe(size({
    title: 'build',
    gzip: true
  }));
});

gulp.task('default', ['clean'], function() {
  gulp.start('build');
});

//////////////////////////////////////
//               TEST               //
//////////////////////////////////////

gulp.task('jshint:test', function() {
  return gulp.src('test/spec/**.js')
    .pipe(jshint('test/.jshintrc'))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});

gulp.task('wiredep:test', function() {
  return gulp.src(karmaConfig.unit.configFile)
    .pipe(wiredep({
      devDependencies: true,
      ignorePath: /\.\.\//,
      directory: './bower_components',
      fileTypes: {
        js: {
          block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
          detect: {
            '.es5.js': /'(.*\.js)'/gi
          },
          replace: {
            '.es5.js': '\'{{filePath}}\','
          }
        }
      }
    }))
    .pipe(gulp.dest('./test'));
});

gulp.task('test', ['wiredep:test'], function() {
  return gulp.src([])
    .pipe(karma({
      configFile: karmaConfig.unit.configFile,
      action: 'run'
    }))
    .on('error', function(err) {
      throw err;
    });
});


//////////////////////////////////////
//            RUN DIST              //
//////////////////////////////////////

gulp.task('server:dist', function() {
  connect.server({
    root: appConfig.dist,
    hostname: appConfig.hostname,
    port: appConfig.port,
    livereload: true,
    middleware: function(connect) {
      var middlewares = [
        connect.static(appConfig.dist)
      ];
      middlewares.push(modRewrite([appConfig.rewriteRule]));
      return middlewares;
    }
  });
});

gulp.task('openUrl:dist', function() {
  var options = {
    url: appConfig.url
  };
  return gulp.src(appConfig.dist + '/index.html')
    .pipe(openUrl('', options));
});

gulp.task('serve:dist', ['build', 'server:dist'], function() {
  gulp.start('openUrl:dist');
});
