var util = require('util');
var http = require('http');
var express = require('express');
var passport = require('passport');
var  GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//requiring in what was in express 3 natively
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var logger = require('morgan');


// API Access link for creating client ID and secret:
// https://code.google.com/apis/console/
// Get your codes here, put them in the .env file.
var port = process.env.PORT || 3000;
var GOOGLE_CLIENT_ID =  process.env.GOOGLE_CLIENT_ID;
var GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session. This isn't
//   connected to a DB, so the whole profile object is being used.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

// Use the GoogleStrategy within Passport
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Google
//   profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:" + port + "/auth/google/return"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification
    process.nextTick(function () {
    //with a real DB we'd return our own user object rather than the profile
      return done(null, profile);
    });
  }
));

var app = express();

// configure Express
  app.use(logger());
  app.use(cookieParser());
  app.use(bodyParser());
  app.use(methodOverride());
  app.use(session({ secret: 'helloNSA'}));
  app.use(passport.initialize());
  app.use(passport.session());
  //app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.send({ user: req.user }); //with no user, sends empty object;
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.send({ user: req.user });
});

app.get('/login', function(req, res){
  res.send({ user: req.user });
});

// GET /auth/google
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  The first step in Google authentication will involve
//   redirecting the user to google.com.  After authorization, Google
//   will redirect the user back to this application at /auth/google/callback
app.get('/auth/google',
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }),
  function(req, res){
    // The request will be redirected to Google for authentication, so this
    // function will not be called.
  });

// GET /auth/google/callback
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page but display
//   the google profile object.
app.get('/auth/google/return',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(port);


// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/');
}