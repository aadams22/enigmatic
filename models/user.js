var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    convoSchema = require('./convo.js').schema;


var userSchema = new Schema({
    _id: { type: Number, unique: true },
    userProfile: {
                  email: { type: String, unique: true },
                  displayName: { type: String }
                  },
    convos: [],
    totalFriends: { type: Number },
    providerData: {
                  accessToken:  { type: String } ,
                  refreshToken: { type: String }
                  },
    friends: []
});


var User = mongoose.model('User', userSchema);
module.exports = User;
