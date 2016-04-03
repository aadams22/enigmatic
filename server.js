var express          = require('express'),
    mongoose         = require('mongoose'),
    passport         = require('passport'),
    Strategy         = require('passport-facebook').Strategy,
    app              = express(),
    port             = process.env.PORT || 8080;

//Require Models
var User             = require('./models/user.js'),
    Convo            = require('./models/convo.js'),
    Message          = require('./models/message.js');

//==================================
//Requiring Encryption

var crypto    = require('crypto');

function encrypt(key, data) {
  var cipher = crypto.createCipher('aes256', key);
  var crypted = cipher.update(data, 'utf-8', 'hex');
  crypted += cipher.final('hex');

  return crypted;
}


function decrypt(key, data) {
  var decipher = crypto.createDecipher ('aes256', key);
  var decrypted = decipher.update(data, 'hex', 'utf-8');
  decrypted += decipher.final('hex');

  return decrypted;
}

var key = new Buffer ('Q93HDHKID6EN14OF595032JN63446295')

decrypt(key, encrypt(key, 'hello world'));


//==================================

var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/enigmatic';
mongoose.connect(mongoUri);


//==================================
app.use(express.static('public'));
app.use(require('morgan')('dev'));
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

  socket.on('get-name', function(name){
    console.log('THIS IS SOCKET nickname: ', name);
    socket.username = name;

  });


  console.log('Socket connected: ', socket.id);
  clients.push(socket.id);
  // console.log('All clients: ', clients);

  io.emit('allClients', clients);



  socket.on('new-message', function(data){
    var id = data.socketId;
    console.log('THIS IS CONNECTED: ', id);
    console.log('1. THIS IS THE MESSAGE: ', data.msg);
    console.log('2. THIS IS THE USERNAME: ', socket.username);
    console.log('2. THIS IS THE OTHER USERS socketId: ', data.id);
    console.log('4. THIS IS THE CONVOID: ', data.convoId)

    //encrypts message with AES256
    var encryptedMsg = encrypt(key, data.msg);

    // io.emit('Private', "Message is going from server to client " + data.msg);
    io.to(id).emit('Private', {
      name: socket.username,
      message: encryptedMsg,
      convoId: data.convoId
    });
  }); //<--new-message



  socket.on('decrypt-msg', function(data){
    var id = data.onlineUserSocketId;
    var msg = data.msg.split(' ')[1].trim();
    var decryptedMsg = decrypt(key, msg);
    console.log('DECRYPT MSG: ', decryptedMsg);

    io.to(id).emit('decrypt-private', { 'msg': decryptedMsg });
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

//==================================

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



 //GETFRIENDS ROUTE for finding your friends
 app.post('/createNewConvo', function(req, res){
   console.log("============== createorfind accessed ==============");
   console.log('name: ', req.body.name);
   console.log('my name: ', req.user.userProfile.displayName);
   var newConvo = Convo();

    //creates a unique convo id of the two user's combined unique ids so that it can't be
    //duplicated and can be accessed by both users
    newConvo._id = parseInt(req.user.id + req.body.id);

    //saving the participants of the conversation to the convo so that their
    //names can be added to the chat
    newConvo.participants.push(req.body.name, req.user.userProfile.displayName);

    //if the user is currently online, the online user's socketId will be saved to
    //the new convo so that it can be accessed once redirected to /messenger
    if(req.body.id != null) {
      newConvo.socketId = req.body.socketId;
    }

    newConvo.save(function(err, data){
      console.log('saving error: ', err);
    });


    User.findByIdAndUpdate(req.user.id, {$push: { "convos": { newConvo } }}, { new: true }, function(err, data){
      console.log('THESE ARE USERS CONVOS: ', data.convos);
     data.convos.push(newConvo);
    });

    User.findByIdAndUpdate(req.body.id, {$push: { "convos": { newConvo } }}, { new: true }, function(err, data){
      // console.log('THESE ARE OTHER USERS CONVOS: ', data.convos);
      data.convos.push(newConvo);
    });


 });


 app.post('/saveMessage', function(req, res){
   console.log("============== saveMessage accessed ==============");
   console.log('1. ', req.body.message);
   console.log('2. ', req.body.previousUsersConvo);
   console.log('3. ', req.body.username);
    var aMessage = Message();

    aMessage.message = req.body.message;
    aMessage.sender = req.body.username;

    aMessage.save(function(err, data){
      console.log('!!saving err!! ', err);
    });


    Convo.findByIdAndUpdate(req.body.previousUsersConvo, {$push: { "messages": { aMessage } }}, { new: true }, function(err, data){
      data.messages.push(aMessage);
    });

    //adds to you the online user
    User.findById(req.user.id, function(err, data){
      Convo.findByIdAndUpdate(req.body.previousUsersConvo, {$push: { "messages": { aMessage } }}, { new: true }, function(err, data){
        // console.log('THIS IS THE USER FOUND CONVO MESSAGES : ', data.messages);
        data.messages.push(aMessage);
      });
    });





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
