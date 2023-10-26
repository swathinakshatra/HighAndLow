require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
  registrationValidation,

  loginValidation,
  validateenc,
} = require("../helpers/validations");
const auth=require('../middleware/auth');
const Queries = require("../helpers/mongofunctions");
const { generateId} = require("../helpers/generateid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amw=require('../middleware/async');
const crypto=require('../helpers/crypto');
const teleg=require('../helpers/telegram');
const redis=require('../helpers/redis');
const tiger=require('../helpers/tigerbalm');
router.post('/registration', amw(async (req, res) => {
const decrypted = crypto.decryptobj(req.body.enc);
 
  const { error } = registrationValidation(decrypted);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }
  const phoneExists = await Queries.findOne({phone:tiger.encrypt(decrypted.phone)}, 'User');
  if (phoneExists) {
      return res.status(400).send('Phone number already registered');
  }

  const newusers = {
      userid: generateId(),
      name: decrypted.name,
      phone:tiger.encrypt(decrypted.phone),
      balance: 100
  };

  const salt = await bcrypt.genSalt(10);
  newusers.password = await bcrypt.hash(decrypted.password, salt); 
  const insertedUser = await Queries.insert("User", newusers);

  await teleg.alert_Developers("Registration successful: " + newusers.name + " registered.");

  if (!insertedUser)  return res.status(400).send('Failed to Register')
    const redisInsert = await redis.redishset("userdata", newusers.userid, JSON.stringify(insertedUser));
      
      console.log(redisInsert,"redis")
        const getredis=await redis.redishget("userdata",newusers.userid);
        console.log("getredis",getredis);
      if (!redisInsert) return res.status(400).send('Failed to insert user data in Redis');
      return res.status(200).send(crypto.encryptobj("User Registration Successfully"));
 
}));
 
router.post('/login',amw(async (req, res) => {
 
 const decrypted = crypto.decryptobj(req.body.enc);
  const { error } = loginValidation(decrypted);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }
  
  const user = await Queries.findOne({phone:tiger.encrypt(decrypted.phone)}, 'User');
  if (!user) {
      return res.status(400).send('User phone number not registered');
  }

  const validPassword = await bcrypt.compare(decrypted.password, user.password);
  if (!validPassword) {
      return res.status(400).send('Invalid Password, please enter a valid password');
  }

  const token = jwt.sign({
      userid: user.userid,
      name: user.name,
      phone: tiger.decrypt(user.phone),
      balance:user.balance
      
  }, process.env.jwtPrivateKey, { expiresIn: '90d' });

  const encryptedResponse = ({
    token: token,
    message: "Login successfully",
  });
  return res.status(200).send(crypto.encryptobj(encryptedResponse));
}));

router.post('/registrations', amw(async (req, res) => {
  //const decrypted = crypto.decryptobj(req.body.enc);

const { error } = registrationValidation(req.body);
if (error) {
    return res.status(400).send(error.details[0].message);
}


const phoneExists = await Queries.findOne({ phone:tiger.encrypt(req.body.phone) }, 'User');

if (phoneExists) {
    return res.status(400).send('Phone number already registered');
}


const newusers = {
    userid: generateId(),
    name: req.body.name,
    phone: tiger.encrypt(req.body.phone),
    balance: 50
};
const salt = await bcrypt.genSalt(10);
newusers.password = await bcrypt.hash(req.body.password, salt); 
const insertedUser = await Queries.insert("User", newusers);

await teleg.alert_Developers("Registration successful: " + newusers.name + " registered.");

if (!insertedUser)  return res.status(400).send('Failed to Register')
    
 

    
    const redisInsert = await redis.redishset("userdata", newusers.userid, JSON.stringify(insertedUser));
    
    console.log(redisInsert,"redis")
      const getredis=await redis.redishget("userdata",newusers.userid);
      console.log("getredis",getredis);
    if (!redisInsert) return res.status(400).send('Failed to insert user data in Redis');
    return res.status(200).send(("User Registration Successfully"));

}));

router.post('/logins',amw(async (req, res) => {

//const decrypted = crypto.decryptobj(req.body.enc);
const { error } = loginValidation(req.body);
if (error) {
    return res.status(400).send(error.details[0].message);
}


const user = await Queries.findOne({ phone:tiger.encrypt(req.body.phone)}, 'User');
if (!user) {
    return res.status(400).send('User phone number not registered');
}

const validPassword = await bcrypt.compare(req.body.password, user.password);
if (!validPassword) {
    return res.status(400).send('Invalid Password, please enter a valid password');
}

const decryptPhone=tiger.decrypt(user.phone)
const token = jwt.sign({
    userid: user.userid,
    name: user.name,
    phone: decryptPhone,
    balance:user.balance
    
}, process.env.jwtPrivateKey, { expiresIn: '90d' });

const encryptedResponse = ({
  token: token,
  message: "Login successfully",
});
return res.status(200).send((encryptedResponse));
}));








module.exports = router;


