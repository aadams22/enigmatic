//PASSPORT FACEBOOK OAUTH

module.exports = function(app, passport, Strategy, User){


  passport.use(new Strategy({
   clientID: process.env.FB_SECRET_KEY,
   clientSecret: process.env.FB_SECRET,
   callbackURL: 'http://localhost:8080/login/facebook/return' || 'http://http://enig-matic.herokuapp.com/login/facebook/return',
   profileFields: ['id', 'displayName', 'email', 'friends'],
   enableProof: true
  },
  function(accessToken, refreshToken, profile, done){
   console.log('this is new Strategy user profile: ', profile);
   console.log('this is the access token: ', accessToken);
   console.log('this is the refresh token: ', refreshToken);
   // console.log('these are your friends: ', profile._json.friends.data);
   var theAccessToken = accessToken;
   var theRefreshToken = refreshToken;


   User.findOne({ '_id' : profile.id }, function(err, user) {
     console.log('this is find or create user ', user);


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



}
