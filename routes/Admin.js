
const express = require("express");
const router = express.Router();
const {
  loginValidation, adminValidation,
  
} = require("../helpers/validations");
const Queries = require("../helpers/mongofunctions");
const { generateId } = require("../helpers/generateid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amw=require('../middleware/async');
const teleg=require('../helpers/telegram');
const tiger=require('../helpers/tigerbalm');

router.post('/registration',amw(async (req, res) => {
 
  const { error} = adminValidation(req.body);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }
  const phoneExists = await Queries.findOne({ phone:tiger.encrypt(req.body.phone)}, 'Admin');
  if (phoneExists) {
      return res.status(400).send('Phone number already registered');
  }
     const newadmins = {
      adminid: generateId(),
      name: req.body.name,
      password:req.body.password,
      phone: tiger.encrypt(req.body.phone),
      adminType:req.body.adminType
    };
    const salt = await bcrypt.genSalt(10);
    newadmins.password = await bcrypt.hash(newadmins.password, salt);
    const inserted = await Queries.insert("Admin", newadmins);
    await teleg.alert_Developers(
      "Reistration successfully: " +
        newadmins.name  +
        "registered: ");
    if (inserted) {
      return res.status(200).send('Admin Registration Successful');
    } else {
      return res.status(400).send("Failed to Register");
    }
  }
));
router.post('/login',amw(async (req, res) => {
const { error } = loginValidation(req.body);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }
  const admin = await Queries.findOne({ phone:tiger.encrypt(req.body.phone) }, 'Admin');
  if (!admin) {
      return res.status(400).send('Admin phone number not registered');
  }
  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if (!validPassword) {
      return res.status(400).send('Invalid Password, please enter a valid password');
    }
 const token = jwt.sign({
      adminid: admin.userid,
      name: admin.name,
      phone: tiger.decrypt(admin.phone),
      adminType:admin.adminType
  }, process.env.jwtPrivateKey, { expiresIn: '90d' });

  const Response = ({
    token: token,
    message: "Login successfully",
  });
  return res.status(200).send(Response);
}));
module.exports=router