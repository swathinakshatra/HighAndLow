const mongoose = require('mongoose');
const gameSchema = new mongoose.Schema({
gameId:{
      type:String,
      required:true,
      unique:true
    },
 Number: {
    type: Number,
    required: true
  },
  userGuess:{
    type:String,
},
  result:{
    type:String,
  }

  
});

const Game = mongoose.model('Game', gameSchema);
exports.Game = Game;

