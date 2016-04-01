var mongoose = require('mongoose'),
    Schema   = mongoose.schema;

var messageSchema = new Schema({
  message: { type: String },
  sender: { type: String }
});


var Message = mongoose.model('Message', messageSchema);
module.exports = Message;
