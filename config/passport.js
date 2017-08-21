var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var GithubStrategy = require("passport-github2").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;
var Intercom = require('intercom-client');
var config = require('./api.js');

//test app
var client = new Intercom.Client({ token: process.env.INTERCOM_ACCESS_TOKEN || 'intercom_access_token'});

module.exports = function(passport) {
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {

        // writing users into Intercom list
        var newUser = {
            name: user.username || user.login,
            user_id: user.id,
            email: (typeof user.emails !== "undefined" && typeof user.emails[0] !== "undefined") ? user.emails[0].value : user.id
        };

        client.users.create(newUser);

        done(null, newUser);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user, done) {
        done(null, user);
    });

    passport.use(new GoogleStrategy({
            clientID        : process.env.GOOGLE_CLIENT_ID || "client_id",
            clientSecret    : process.env.GOOGLE_SECRET || "client_secret",
            callbackURL     : process.env.GOOGLE_REDIRECT_URL || config.url + "auth/google/callback"
        },
        function(token, refreshToken, profile, done) {
            return done(null, profile);
        }));

    passport.use(new GithubStrategy({
            clientID        : process.env.GITHUB_CLIENT_ID || "client_id",
            clientSecret    : process.env.GITHUB_SECRET || "client_secret",
            callbackURL     : process.env.GITHUB_REDIRECT_URL || config.url + "auth/github/callback"
        },
        function(token, refreshToken, profile, done) {
            return done(null, profile);
        }));

    passport.use(new FacebookStrategy({
            clientID        : process.env.FACEBOOK_CLIENT_ID || "client_id",
            clientSecret    : process.env.FACEBOOK_SECRET || "client_secret",
            callbackURL     : process.env.FACEBOOK_REDIRECT_URL || config.url + "auth/facebook/callback",
            profileFields: ['emails'],
            enableProof: true
        },
        function(token, refreshToken, profile, done) {
            return done(null, profile);
        }));
};