var express          = require('express')
    app              = express(),
    passport         = require('passport'),
    Strategy         = require('passport-facebook').Strategy,
    mongoose         = require('mongoose'),
    cookieParser     = require('cookie-parser');


//LOGIN RENDER
app.get('/', function(req,res){
  res.render('login.ejs', { user: req.user });
});

//FACEBOOK OAUTH
app.get('/facebook', passport.authenticate('facebook'));

//FACEBOOK OAUTH CALLBACK
app.get('/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login'}),
  function(req,res){
    res.redirect('/');
});

//IS LOGGED IN
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}
