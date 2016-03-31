var express          = require('express'),
    mongoose         = require('mongoose'),
    morgan           = require('morgan'),
    passport         = require('passport'),
    Strategy         = require('passport-facebook').Strategy,
    port             = process.env.PORT || 8080;
    User             = require('./models/user.js'),
    Convo            = require('./models/convo.js'),
    app              = express();

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/enigmatic';
mongoose.connect(mongoUri);


//==================================
app.use(express.static('public'));
app.use(morgan('dev'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'sunny yesterday my life was feelin grey', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

//==================================



// require('./config/routes.js')(app,mongoose,passport,User)
// require('./config/passport.js')(app,passport,Strategy)
//==================================
passport.use(new Strategy({
 clientID: process.env.FB_SECRET_KEY,
 clientSecret: process.env.FB_SECRET,
 callbackURL: 'http://localhost:8080/login/facebook/return' || 'http://http://enig-matic.herokuapp.com/login/facebook/return',
 profileFields: ['id', 'displayName', 'email', 'friends'],
 enableProof: true
},
function(accessToken, refreshToken, profile, done){
 // console.log('this is new Strategy user profile: ', profile);
 // console.log('this is the access token: ', accessToken);
 // console.log('this is the refresh token: ', refreshToken);
 // console.log('these are your friends: ', profile._json.friends.data);
 var theAccessToken = accessToken;
 var theRefreshToken = refreshToken;


 User.findOne({ '_id' : profile.id }, function(err, user) {
   console.log('this is find or create user ');


   if (err) {
     console.log("things broke")
     return done(err)
   }
   if (!user) {
     console.log('making new person, no one found');
     var newUser = new User();

     newUser._id                        = profile.id;
     newUser.userProfile.displayName    = profile.displayName;
     newUser.userProfile.email          = profile.emails[0].value;
     // newUser.friends.name               = profile._json.friends.data.name;
     // newUser.friends.id                 = profile._json.friends.data.id;
     newUser.friends                    = profile._json.friends.data;
     newUser.totalFriends               = profile._json.friends.summary.total_count;
     newUser.provider                   = 'facebook';
     newUser.providerData.accessToken   = theAccessToken;
     newUser.providerData.resfreshToken = theRefreshToken;


     newUser.save(function(err){
       console.log("THIS USER IS NEW: " + newUser)
       if (err) {
         throw err;
         return done(null, newUser);
       }else {
           console.log("NEW USER SAVED");
           return done(err,user);
         }
     }); //<--newUser.save



   }else {
       User.findOneAndUpdate({ '_id' : profile.id }, { 'friends' : profile._json.friends.data}, function(err, user){
         console.log('THIS IS FOUND AND UPDATED: ', user);
         return done(err,user);
       });

   }

 }); //<---user findOne

}));




//SOCKETS
var http = require('http').Server(app),
    io   = require('socket.io')(http);

var clients = [];

io.on('connection', function(socket) {

  console.log('Socket connected: ', socket.id);
  clients.push(socket.id);
  // console.log('All clients: ', clients);

  io.emit('allClients', clients);

  socket.on('socket-id', function(socketId, msg){
    console.log('THIS IS CONNECTED: ', socketId);
    console.log('1. THIS IS THE MESSAGE: ', msg);
    io.to(socketId).emit('Private', msg);
    console.log('2. THIS IS THE MESSAGE: ', msg);
  });


  socket.on('disconnect', function() {
    var index = clients.indexOf(socket.id);
    if (index != -1) {
      clients.splice(index, 1);
      console.info('Client disconnected: ', + socket.id);
      // console.log('All clients: ', clients);
    }
  })

});



 //==================================


   //PASSPORT SERIALIZATIONS
   passport.serializeUser(function(user, done) {
      done(null, user.id);
   });

   passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
          done(err, user);
      });
   });





 app.get('/', function(req,res){
   // isLoggedIn();
   res.render('index.ejs', { user: req.user });
 });

 //PROFILE
 app.get('/profile', require('connect-ensure-login').ensureLoggedIn(),
   function(req,res){
     res.render('profile.ejs', { user: req.user });
 });

 //MESSANGER ROUTE
 app.get('/messanger', function(req, res){
     res.render('messanger.ejs', { user: req.user });
 });

 //FRIENDS ROUTE
 app.get('/friends', function(req, res){
   res.render('friends.ejs', { user: req.user });
 });

 app.get('/json', function(req, res){
   console.log(req.user.id);
   User.findById(req.user.id, function(err, data){
     res.send(data);
   });
 });

 // //GETFRIENDS ROUTE for finding your friends
 app.post('/createNewConvo', function(req, res){
   console.log("============== createorfind accessed ==============");
   console.log('name: ', req.body.name);
   console.log('my name: ', req.user.userProfile.displayName);
   var combined = parseInt(req.user.id + req.body.id);
   var newConvo = Convo();
   var socketId = null;

    //
    // io.on('connection', function(socket) {
    //   console.log('Socket connected: ', socket.id);
    //   // var socketId = socket.id;
    //   clients.push(socket.id);
    //   socket.on('socket-id', function(socketId, msg){
    //     console.log('THIS IS CONNECTED: ', socketId);
    //     io.to(socketId).emit('Private', msg);
    //   });
    // });

    newConvo.id = combined;
    newConvo.participants.push(req.body.name, req.user.userProfile.displayName);
    // newConvo.socketId = socketId;
    //
    //  newConvo.save(function(err){
    //    console.log('saving error: ', err);
    //    res.redirect('/messanger')
    //  });

 });

 //LOGOUT
 app.get('/logout', function(req, res) {
     req.logout();
     res.redirect('/');
 });


 //FACEBOOK OAUTH
 app.get('/login/facebook',
   passport.authenticate('facebook',  { scope: ['user_friends', 'email'] })
 );

 //FACEBOOK OAUTH CALLBACK
 app.get('/login/facebook/return',
   passport.authenticate('facebook', { failureRedirect: '/' }),
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
//LISTEN
http.listen(port, function(){
  console.log('running beautiful on a beautiful day!')
});
