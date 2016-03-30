module.exports = function(app,mongoose,passport){


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

}
