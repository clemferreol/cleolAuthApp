var express = require('express');
var passport = require('passport');
var Strategy = require('passport-github').Strategy;
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var util = require('util');
var partials = require('express-partials');
var request = require('request');

// initialisation express
var app = express();


// constantes
var EXAMPLE_CLIENT_ID = '6203b696f1e0bc1821c8';
var EXAMPLE_CLIENT_SECRET = 'b239a93816bdaf015b87050cf75e1533316de352';
var gitUser = null;
var repos;

// instancier la stratégie OAuth avec passport
passport.use(new Strategy({
    clientID: EXAMPLE_CLIENT_ID,
    clientSecret: EXAMPLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8080/auth/github/callback"
  }, function(accessToken, refreshToken, profile, cb) {
      gitUser = profile._json;
      return cb(null, profile);
}));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

// Dire a express d'utiliser passport
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'cleol', resave: false, saveUninitialized: false }));
// set the view engine to ejs
app.set('view engine', 'ejs');
app.use(partials());



// Route homepage
app.get('/', function(req, res){
	
	res.render('index', {user: gitUser});
});


// route done

app.get('/login', passport.authenticate('github', {scope : ['user', 'repo']}));

app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/profile', function(req, res){
    
    //console.log(gitUser.repos_url);
    res.render('done', { user: gitUser, repos});
  });

app.get('/repos', function(req,res){
    request({
      uri: gitUser.repos_url,
      json: true,
      headers: {
        'User-Agent': 'cleolAuthApp'
      }
      
    },
    function(error, response, body) {
      res.render('done', {user: gitUser, repos: body})
    });
    
});

// demarrer le serveur
app.listen(8080);
console.log('Le serveur a démarré!!! youpi');

/*
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/profile');
}*/