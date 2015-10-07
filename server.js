var express = require('express');
var path = require('path');
var url = require('url');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var UserApp = require('userapp');

var routes = require('./routes.js');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

UserApp.initialize({appId: '55d4b6eb20d74'});


var cookieAuth = function (req, res, next) {
    if (!req.cookies.ua_session_token) {
        res.status(403).send('Access Denied');
        return next(false);
    }

    // all operations to work as we working in same thread
    UserApp.setToken(req.cookies.ua_session_token);
    UserApp.User.get({}, function (error, result) {
        if (error) {
            res.clearCookie('ua_session_token');
            res.status(401).json(error);
            return next(false);
        } else {
            req.user = result[0];
            next();
        }});

};


// main routes
app.get('/info', cookieAuth, routes.info);


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
