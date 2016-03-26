var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema;
    userSchema = require('/user.js').schema;


var convoSchema = new Schema({
  // messages: [],
  participants: [userSchema],
  created_at: { type: Date },
  updated_at: { type: Date }
});


convoSchema.pre('save', function(next){
  now = new Date();
  this.updated_at = now;
  if ( !this.created_at ) {
    this.created_at = now;
  }
  next();
});


var Convo = mongoose.model('Convo', convoSchema);
module.exports = Convo;
