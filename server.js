var express          = require('express'),
    mongoose         = require('mongoose'),
    morgan           = require('morgan'),
    passport         = require('passport'),
    Strategy         = require('passport-facebook').Strategy,
    port             = process.env.PORT || 8080;
    User             = require('./models/user.js'),
    app              = express();

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/enigmatic';
mongoose.connect(mongoUri);

app.use(express.static('public'));

 //==================================
//PASSPORT FACEBOOK OAUTH
passport.use(new Strategy({
  clientID: process.env.FB_SECRET_KEY,
  clientSecret: process.env.FB_SECRET,
  callbackURL: 'http://localhost:8080/login/facebook/return' || 'http://http://enig-matic.herokuapp.com/login/facebook/return'
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

//PASSPORT SERIALIZATIONS
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

//END OF PASSPORT

//==================================

app.use(morgan('dev'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'sunny yesterday my life was feelin grey', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

 //==================================
//PASSPORT ROUTES

// var passportController = require('./controllers/passportController.js');
// app.use('/login', passportController);


app.get('/', function(req,res){
  res.render('index.ejs', { user: req.user });
});

//PROFILE
app.get('/profile', require('connect-ensure-login').ensureLoggedIn(),
  function(req,res){
    res.render('profile.ejs', { user: req.user });
});

//LOGOUT
app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});


//LOGIN RENDER
// app.get('/login', function(req,res){
//   res.render('login.ejs', { user: req.user });
// });

//FACEBOOK OAUTH
app.get('/login/facebook', passport.authenticate('facebook'));

//FACEBOOK OAUTH CALLBACK
app.get('/login/facebook/return',
  passport.authenticate('facebook', { failureRedirect: '/'}),
  function(req,res){
    res.redirect('/');
});

//IS LOGGED IN
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}



//==================================
//SOCKETS
var http = require('http').Server(app),
    io   = require('socket.io')(http);
    nsp  = io.of('/my-namespace');
    // console.log(nsp);


io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

//MESSANGER ROUTE
app.get('/messanger',
  function(req,res){
    res.render('messanger.ejs', { user: req.user });
});


//==================================
//LISTEN
http.listen(port, function(){
  console.log('running beautiful on a beautiful day!')
});
