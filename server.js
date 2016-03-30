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

require('./config/passport.js')(app,passport,Strategy)

//==================================

app.use(morgan('dev'));
app.use(require('cookie-parser')());
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'sunny yesterday my life was feelin grey', resave: true, saveUninitialized: true}));
app.use(passport.initialize());
app.use(passport.session());

 //==================================
//ROUTES

// var passportController = require('./controllers/passportController.js');
// app.use('/', passportController);


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
  console.log("============== createorfind accessed ==============", res);

  var newConvo = Convo();

    // newConvo.id = res.fullId;


    // newConvo.save(function(err){
    //   console.log('saving error: ', err);
    // });

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
//SOCKETS
var http = require('http').Server(app),
    io   = require('socket.io')(http);

var clients = [];

io.on('connection', function(socket) {

  // console.log('Socket connected: ', socket.id);
  clients.push(socket.id);
  // console.log('All clients: ', clients);

  io.emit('allClients', clients);

  socket.on('socket-id', function(socketId, msg) {
    // console.log(socketId);
    io.to(socketId).emit('Private', 'You are the chosen one');
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
//LISTEN
http.listen(port, function(){
  console.log('running beautiful on a beautiful day!')
});
