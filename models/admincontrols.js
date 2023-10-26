const mongoose = require('mongoose');

const adminControlsSchema = new mongoose.Schema({
  register: { type: String, required: true, default: "Enable" },
  login: { type: String, required: true, default: "Enable" },
  transfer: { type: String, required: true, default: "Enable" },
  bet:{type:String,required:true,default:'Enable'},
  odds: {
    high: { type: String, required: true, default:"0"},
    low: { type: String, required: true, default: "0"},
    equal: { type:String, required: true, default: "0"},
  },
});

const AdminControls = mongoose.model('AdminControls', adminControlsSchema);
exports.AdminControls = AdminControls;