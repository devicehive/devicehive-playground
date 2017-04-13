var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
var GithubStrategy = require("passport-github2").Strategy;
var FacebookStrategy = require("passport-facebook").Strategy;

module.exports = function(passport) {

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        if (typeof user.emails !== "undefined" && typeof user.emails[0] !== "undefined") { // Serialize by primary public email
            done(null, user.emails[0].value);
        } else {
            done(null, user.id) // Serialize by id
        }
    });

    // used to deserialize the user
    passport.deserializeUser(function(email, done) {
        done(null, email);
    });

    passport.use(new GoogleStrategy({
            clientID        : process.env.GOOGLE_CLIENT_ID || "client_id",
            clientSecret    : process.env.GOOGLE_SECRET || "client_secret",
            callbackURL     : process.env.GOOGLE_REDIRECT_URL || "http://playground.devicehive.com/auth/google/callback"
        },
        function(token, refreshToken, profile, done) {
            return done(null, profile);
        }));

    passport.use(new GithubStrategy({
            clientID        : process.env.GITHUB_CLIENT_ID || "client_id",
            clientSecret    : process.env.GITHUB_SECRET || "client_secret",
            callbackURL     : process.env.GITHUB_REDIRECT_URL || "http://playground.devicehive.com/auth/github/callback"
        },
        function(token, refreshToken, profile, done) {
            return done(null, profile);
        }));

    passport.use(new FacebookStrategy({
            clientID        : process.env.FACEBOOK_CLIENT_ID || "client_id",
            clientSecret    : process.env.FACEBOOK_SECRET || "client_secret",
            callbackURL     : process.env.FACEBOOK_REDIRECT_URL || "http://playground.devicehive.com/auth/facebook/callback",
            profileFields: ['emails'],
            enableProof: true
        },
        function(token, refreshToken, profile, done) {
            return done(null, profile);
        }));
};