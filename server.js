var express = require('express');
var path = require('path');
var url = require('url');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var routes = require('./routes.js');
var passport = require('passport');

// Init oauth configs
var googleConfig = require('./config/passport')(passport);

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
var session = require('express-session');

// Config express session
app.use(session(
    {
        secret: "secret",
        resave: true,
        saveUninitialized: true,
        rolling: true,
        cookie: { httpOnly: false } // Necessary for accessing cookies from js
    }
));
app.use(passport.initialize());
app.use(passport.session());


var authFilter = function (req, res, next) {
    if (!req.user) {
        res.status(403).send('Access Denied');
        return next(false);
    } else {
        next();
    }
};


// main routes
app.get('/info', authFilter, routes.info);

// oauth routes
// google
app.get('/auth/google', passport.authenticate('google', {
    scope : ['https://www.googleapis.com/auth/plus.me','https://www.googleapis.com/auth/userinfo.email']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: "/",
        failureRedirect : '/'
    })
);

// github
app.get('/auth/github',passport.authenticate('github', { scope : ['user:email'] }));

app.get('/auth/github/callback',
    passport.authenticate('github', {
        successRedirect: "/",
        failureRedirect : '/'
    })
);

// facebook
app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['public_profile', 'email'] }));

app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: "/",
        failureRedirect : '/'
    })
);

app.get('/logout', function (req, res) {
    req.session.destroy();
    res.redirect('/');
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
