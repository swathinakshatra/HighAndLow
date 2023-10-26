const mongoose=require('mongoose');
const userschema=new mongoose.Schema({
userid:{
    type:String,
    required:true,
    unique:true
},
name:{
    type:String,
    required:true,
    minlength: 3,
    maxlength: 50  
},

password:{
    type:String,
    required:true,
    minlength: 5,
    maxlength: 1024
},
phone:{
    type:String,
    required:true,
    unique:true,
   

},
balance:{
    type:Number,
    required:true,
    default:'0'
}

},
{
  timestamps: true,
});

const User=mongoose.model("User",userschema);
exports.User=User;