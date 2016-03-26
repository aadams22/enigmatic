var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    convoSchema = require('./convo.js').schema;


var userSchema = new Schema({
    _id: {type: Number, unique: true},
    userProfile: {
              email: {type: String, unique: true},
              displayName: {type: String},
              token: {type: Number}
            },
    convos: [convoSchema],
    friends: [{ type: Number }]
});


var User = mongoose.model('User', userSchema);
module.exports = User;
