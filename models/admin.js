const mongoose=require('mongoose');
const adminSchema=new mongoose.Schema({
adminid:{
    type:String,
    required:true,
    unique:true
},
name:{
    type:String,
    required:true  
},

password:{
    type:String,
    required:true
},
phone:{
    type:String,
    required:true,
    unique:true
},
adminType: { type: String, required: true },
},
{
  timestamps: true,
});
const Admin=mongoose.model("Admin",adminSchema);
exports.Admin=Admin;