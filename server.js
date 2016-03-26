var express          = require('express'),
    mongoose         = require('mongoose'),
    morgan           = require('morgan'),
    passport         = require('passport'),
    Strategy         = require('passport-facebook').Strategy,
    // findOrCreate     = require('mongoose-findorcreate'),
    port             = process.env.PORT || 8080;
    User             = require('./models/user.js')

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/enigmatic';
mongoose.connect(mongoUri);

//PASSPORT
// //findOrCreate now associated with UserSchema
// User.plugin(findOrCreate);


passport.use(new Strategy({
  clientID: process.env.FB_SECRET_KEY,
  clientSecret: process.env.FB_SECRET,
  callbackURL: 'http://localhost:8080/login/facebook/return'
},
function(accessToken, refreshToken, profile, done){
  console.log('this is new Strategy user profile ', profile);
  // return done(null, profile);

  User.findOne({ '_id' : profile.id }, function(err, user) {
    console.log('this is find or create user ', user);

    if (err) {
      console.log("things broke")
      return done(err)
    }
    if (!user) {
      console.log('making new person, no one found');
      var newUser = new User();

      newUser._id = profile.id;
      // newUser.userProfile.token = profile.token;
      newUser.userProfile.displayName = profile.displayName;
      // newUser.userProfile.email = profile.emails[0].value;

      newUser.save(function(err){
        if (err) {
          throw err;
          return done(null, newUser);
        }

      }) //<--newUser.save

    }else {
      return done(err,user);
    }

  })

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//END OF PASSPORT

var app = express();

app.use(morgan('dev'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'sunny yesterday my life was feelin grey', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());


//PASSPORT ROUTES


app.get('/', function(req,res){
  res.render('index.ejs', { user: req.user});
});

app.get('/login', function(req,res){
  res.render('login.ejs');
});

app.get('/login/facebook', passport.authenticate('facebook'));

app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/login'}),
  function(req,res){
    res.redirect('/');
});

app.get('/profile', require('connect-ensure-login').ensureLoggedIn(),
  function(req,res){
    res.render('profile', { user: req.user });
});

app.listen(port, function(){
  console.log('run!')
});
