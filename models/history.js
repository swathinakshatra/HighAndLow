const mongoose = require('mongoose');
const historySchema = new mongoose.Schema(
  {
    time: { type: String, required: true },
    betid: { type: String, required: true, minlength: 5, maxlength: 255 },
    userid: { type: String, required: true, default: 0 },
    name: { type: String},
    odds: { type: String, required: true },
    betPlacedOn: { type: String, required: true },
    betAmount:{type:Number,required:true},
    debited:{type:Number,required:true},
    amountWon:{type:String,required:true},
    status: { type: String, default: 'Pending' },
    Note: { type: String, required: true },


   
  
  }
  
);

const History = mongoose.model('History', historySchema);

exports.History = History;