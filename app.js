/// <reference path=".settings/typings/node/node.d.ts"/>
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var exphbs  = require('express-handlebars');

var routes = require('./routes/index');
var pages = require('./routes/pages');
var landingPages = require('./routes/landing');

var app = express();


//
// view engine setup
//
var handlebars =  exphbs.create({
  defaultLayout: 'main',
  helpers: require('./lib/helpers/handlebars')
});
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//
// More Middleware
//
app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'theme', 'less'), {
  dest: path.join(__dirname, 'public'),
  preprocess: {
    path: function(pathname, req) {
      return pathname.replace(path.sep + 'stylesheets' + path.sep, path.sep);
    }
  }
}));
app.use(express.static(path.join(__dirname, 'public')));


//
// Routes 
//
app.use('/', routes);
app.use('/', landingPages);
app.use('/', pages);


//
// Error handlers
//

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.message);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
