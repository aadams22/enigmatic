var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var messageSchema = new Schema({
  message: { type: String, required: true, trim: true, timestamps: true },
  sender: { type: String },

});




var Message = mongoose.model('Message', messageSchema);
module.exports = Message;
