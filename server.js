var express = require('express');
var path = require('path');
var url = require('url');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Promise = require('promise');
var UserApp = require('userapp');

var config = require('./config/api.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

UserApp.initialize({ appId: '55d4b6eb20d74' });

/**
 * Main entry point.
 * The goal is to get the AccessKey by user's email.
 * 
 * 1. tries to find the User by the email
 *    - if found: tries to get its AccessKey and returns it
 *    - if not found: proceed to step 2
 * 2. creates a new User, Network and AccessKey
 *    - if everything went smooth, returns the AccessKey 
 * 
 */
function get_or_create_playground(email) {
  var api = require('./lib/dh_api.js')(config);
  
  return new Promise(function (fulfill, reject) {
    api.findUserAccessKey(email).then(function (foundAccessKey) {
      if (foundAccessKey)
        fulfill(foundAccessKey);
      else
        return api.createAndInitUser(email).then(function (createdAccessKey) {
          if (createdAccessKey)
            fulfill(createdAccessKey);
          else
            reject("Can't create and init a User");
        });
    }, function(err){
      reject(err);
    });
  });
}

/**
 * Async call handler.
 * Called from public/javascripts/index.js (onUserLoaded)
 */
app.get('/info', function (req, res) {
  if (!req.cookies.ua_session_token) {
    res.status(403).send('Access Denied');
    return;
  }

  // two operations to follow as we working in same thread
  UserApp.setToken(req.cookies.ua_session_token);
  UserApp.User.get({}, function (error, result) {
    if (error) {
      res.status(500).json(error);
    } else {
      var user = result[0];
      
      var promise = get_or_create_playground(user.email);
      promise.then(function (accessKey) {
        try{
          if (user.email && user.email_verified && !user.lock) {
            var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;            
            var info = {
              swagger: url.resolve(fullUrl, config.swagger_url),
              api: url.resolve(fullUrl, config.api_url),
              admin: url.resolve(fullUrl, config.admin_url),
              accessKey: accessKey.key,
              accessKeyEncoded: encodeURIComponent(accessKey.key)
            };
            res.render('info', info);
            
          } else {
            res.status(403).send('Access Denied');
          }
        } catch(err){
          res.status(500).send(err);
        }
      }, function(err){
        res.status(500).send(err);
      });
    }
  });

});



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
