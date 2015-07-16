/// <reference path=".settings/typings/node/node.d.ts"/>

// set up ======================================================================
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var exphbs  = require('express-handlebars');
var docserver = require('docserver');

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('flash');
var session = require('express-session');

var pages = require('./routes/pages');
var landingPages = require('./routes/landing');

var app = express();


// configuration ===============================================================
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database
require('./lib/passport')(passport); // pass passport for configuration

// view engine setup
var handlebars =  exphbs.create({
  defaultLayout: 'main',
  helpers: require('./lib/helpers/handlebars')
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'theme', 'less'), {
  dest: path.join(__dirname, 'public'),
  preprocess: {
    path: function(pathname, req) {
      return pathname.replace(path.sep + 'stylesheets' + path.sep, path.sep);
    }
  }
}));
app.use(docserver({
    dir: __dirname + '/content/docs',  // serve Markdown files in the docs directory...
    url: '/docs/'}                     // ...and serve them from this URL prefix
));
app.use(express.static(path.join(__dirname, 'public')));

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
require('./routes/auth.js')(app, passport); // load our routes and pass in our app and fully configured passport


// routes ======================================================================
app.use('/', pages);
app.use('/', landingPages);


// error handling ==============================================================
app.use(function(req, res, next) { // catch 404 and forward to error handler
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler - will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler - no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
