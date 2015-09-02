var express = require('express');
var path = require('path');
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


function get_or_create_playground(email) {
  // TODO implement me
  // create network, user, token to user
  
  var api = require('./lib/dh_api.js')(config);
  
  return new Promise(function (fulfill, reject) {
    api.findUser(email).then(function (foundUser) {
      console.log('found user = ' + foundUser);
      if (foundUser)
        fulfill(foundUser);
      else
        return api.createUser(email).then(function (createdUser) {
          console.log('created user = ' + createdUser);
          if (createdUser)
            fulfill(createdUser);
          else
            reject("Can't create user");
        });
    })
  });
}


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
    } 
    else {
      var user = result[0];
      
      var promise = get_or_create_playground(user.email);
      promise.then(function (key) {
        if (user.email && user.email_verified && !user.lock) {
          var info = {
            swagger: "http://playground.devicehive.com/api/swagger",
            api: "http://playground.devicehive.com/api/swagger",
            admin: "http://playground.devicehive.com/admin",
            accesskey: JSON.stringify(key)
          };
          
          res.json(info);
        } else {
          res.status(403).send('Access Denied');
        }
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
