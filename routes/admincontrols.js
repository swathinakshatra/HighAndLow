const express = require("express");
const router = express.Router();
const Queries = require("../helpers/mongofunctions");
const auth=require('../middleware/auth');
const amw=require('../middleware/async');
const redis=require('../helpers/redis');
const crypto=require('../helpers/crypto');

router.post("/addadmincontrols",auth,amw(async (req, res) => {
  if (req.user.adminType !== '1') {
    return res.status(400).send("Invalid admintype");
  }
  const Admincontrols = {
    register: "Enable",
    login: "Enable",
    transfer: "Enable",
    odds: {
      high: "33.30%",
      low: "25.76%",
      equal: "40.94%",
    }
  };
  
  const admincontrols = await Queries.insert("AdminControls",Admincontrols);
  if(!admincontrols)  return res.status(400).send('Error in saving AdminControls')

  
  const redisinsert=await redis.redishset(
    "adminControls",
    "Controls",JSON.stringify(admincontrols));
if(!redisinsert) return res.status(400).send("error saving admincontrols in redis")
  return res.status(200).send(("Admin controls added"));
}));

router.post("/getadmincontrols", auth,async (req, res) => {


  const adminexists = await redis.redishexists(
    "adminControls",
    "Controls"
  );
  if (!adminexists) {
    return res.status(400).send("admincontrols not found");
  }
  const getadmin = await redis.redishget(
    "adminControls",
    "Controls"
  );
  return res.status(200).send(crypto.encryptobj(getadmin));
});

module.exports = router;