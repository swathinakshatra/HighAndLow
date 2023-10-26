const express = require('express');
const router = express.Router();
const Queries=require('../helpers/mongofunctions');
const amw=require('../middleware/async');
const auth=require('../middleware/auth');
const {generateId}=require('../helpers/generateid');
const { validatedelete, validateGames, validatehistory, validatedata} = require('../helpers/validations');
const crypto=require('../helpers/crypto');
const addJob = require('../helpers/producer');
const redis=require('../helpers/redis');
router.post('/start', auth, amw(async (req, res) => {
  const userid = req.user.userid;
  const exists = await redis.redishexists("userdata", userid);
  const user = await redis.redishget("userdata", userid);
  console.log("user",user)
 if (!exists) {
    return res.status(400).send('User not found');
  }
  const randomNumber = Math.floor(Math.random() * 21) + 1;
  const gameId = generateId();
  const newdata = {
    gameId: gameId,
    Number: randomNumber,
    userGuess: null, 
    result: 'Pending'
  }
  const insert = await Queries.insert('Game', newdata);
  if (!insert) {
    return res.status(400).send('Error in insert');
  }
  return res.status(200).send(crypto.encryptobj({
    message: 'Game started!',
    number: randomNumber,
    gameId: gameId,
    userBalance:user.balance

  }));
}));
router.post('/guess', auth, amw(async (req, res) => {
   
  const decrypted = crypto.decryptobj(req.body.enc);

 const { error } = validateGames(decrypted);
 if (error) {
     return res.status(400).send(error.details[0].message);
 }

 const userid = req.user.userid;
 const exists = await redis.redishexists("userdata", userid);
 const user = await redis.redishget("userdata", userid);
 console.log("user",user)

 
 if (!exists) {
   return res.status(400).send('User not found');
 }
 
 const gameId = decrypted.gameId;
 const betAmount = parseFloat(decrypted.betAmount);
 const userGuess = decrypted.userGuess;
 const game = await Queries.findOne({ gameId }, 'Game');
 if (!game) {
     return res.status(400).send({ message: 'Game not found' });
 }
 if (betAmount > user.balance) {
  return res.status(400).send('Insufficient balance for the bet');
}
const adminexists = await redis.redishexists(
  "adminControls",
  "Controls"
   );
   if (!adminexists) {
     return res.status(400).send("admincontrols not found");
   }
   const adminControls = await redis.redishget(
    "adminControls",
    "Controls");
   console.log("admincontrols",adminControls)

     const nextNumber = Math.floor(Math.random() * 21) + 1;
     const result =
         (userGuess === 'high' && nextNumber > game.Number) ||
         (userGuess === 'low' && nextNumber < game.Number) ||
         (userGuess === 'equal' && nextNumber === game.Number)
             ? 'win'
             : 'lose';

             const odds = parseFloat(adminControls.odds[userGuess]);
             if (!odds) {
                 return res.status(400).send('Invalid user guess');
             }
             const betid=generateId()
             const updatedGame = await Queries.findOneAndUpdate(
               { gameId: gameId },
               {
                   $set: {
                       userGuess: userGuess,
                       Number: nextNumber,
                       result: result,
                       gameId:betid
                   },
               },
               "Game",
               { new: true });
             
            
        if (!updatedGame) {
              return res.status(400).send('Error updating game');
        }
       
        const jobData = {
         userid:req.user.userid,
         betAmount: betAmount,
         userGuess: userGuess,
         betid:betid,
         odds:odds,
         result:result
       
         
     };

await addJob('update', jobData); 

const sortOptions = { _id: -1 };
       const limitValue = 1;
       const query = { gameId:betid};
       const gameHistory = await Queries.findSort(query, 'History', sortOptions, limitValue);

       const responseData = {
           status:result,
           Number: nextNumber,
           betid:betid
       };
         console.log("response",responseData);
       return res.status(200).send(crypto.encryptobj(responseData));
}));


router.post('/guessdata',auth,amw(async(req,res)=>{
    const decrypted = crypto.decryptobj(req.body.enc);
    const { error } = validatedata(decrypted);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const user=await Queries.findOne({userid:req.user.userid},"User");
  console.log("user",user);
  if(!user) return res.status(400).send("user not  found");
    const history=await Queries.findOneDocument({betid:decrypted.betid},"History");
    if (!history || history.length === 0) {
        return res.status(400).send("History not found");
    }
    const historydata=history.reverse()
    return res.status(200).send(crypto.encryptobj({historydata,user}));
}));
router.post('/history',auth,amw(async(req,res)=>{
    const decrypted = crypto.decryptobj(req.body.enc);
    const { error } = validatehistory(decrypted);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const history=await Queries.findOneDocument({userid:req.user.userid},"History");
    if (!history || history.length === 0) {
        return res.status(400).send("History not found");
    }
    
    const historydata=history.reverse()
  
    return res.status(200).send(crypto.encryptobj(historydata));
}));

router.post('/delete',auth,amw(async(req,res)=>{
  
    const { error } = validatedelete(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const user=await Queries.findOne({userid:req.user.userid},"User");
    if(!user) return res.status(400).send('user not found')
    const gameid=await Queries.findOne({gameId:req.body.gameId},"Game")
    if(!gameid) return res.status(400).send('gameid not found');
    const deleted=await Queries.findOneAndDelete({gameId:req.body.gameId},"Game");
    if(!deleted) return res.status(400).send("error in closing game");
    return res.status(200).send("game closed");

}));

router.post('/alldelete',async(req,res)=>{
    const alldelete=await Queries.Delete("Game");
    if(!alldelete) return res.status(400).send("error in deleting");
    return res.status(200).send("all deleted successfully");

});
















router.post('/guessdatas',auth,amw(async(req,res)=>{
  //const decrypted = crypto.decryptobj(req.body.enc);
  const { error } = validatedata(req.body);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }
  const user=await Queries.findOne({userid:req.user.userid},"User");
console.log("user",user);
if(!user) return res.status(400).send("user not  found");
  const history=await Queries.findOneDocument({betid:req.body.betid},"History");
  if (!history || history.length === 0) {
      return res.status(400).send("History not found");
  }
  const historydata=history.reverse()
  return res.status(200).send(({historydata,user}));
}));




router.post('/starts', auth, amw(async (req, res) => {
  const userid = req.user.userid;
  const exists = await redis.redishexists("userdata", userid);
  const user = await redis.redishget("userdata", userid);
  console.log("user",user.balance)
 if (!exists) {
    return res.status(400).send('User not found');
  }
  const randomNumber = Math.floor(Math.random() * 21) + 1;
  const gameId = generateId();
  const newdata = {
    gameId: gameId,
    Number: randomNumber,
    userGuess: null, 
    result: 'Pending'
  }
  const insert = await Queries.insert('Game', newdata);
  if (!insert) {
    return res.status(400).send('Error in insert');
  }
  return res.status(200).send(({
    message: 'Game started!',
    number: randomNumber,
    gameId: gameId,
    userBalance:user.balance

  }));
}));




router.post('/starts', auth, amw(async (req, res) => {
  const userid = req.user.userid;
  const exists = await redis.redishexists("userdata", userid);
  const user = await redis.redishget("userdata", userid);
  console.log("user",user)
 if (!exists) {
    return res.status(400).send('User not found');
  }
  const randomNumber = Math.floor(Math.random() * 21) + 1;
  const gameId = generateId();
  const newdata = {
    gameId: gameId,
    Number: randomNumber,
    userGuess: null, 
    result: 'Pending'
  }
  const insert = await Queries.insert('Game', newdata);
  if (!insert) {
    return res.status(400).send('Error in insert');
  }
  return res.status(200).send(({
    message: 'Game started!',
    number: randomNumber,
    gameId: gameId,
    userBalance:user.balance

  }));
}));
router.post('/guesss', auth, amw(async (req, res) => {
   
 // const decrypted = crypto.decryptobj(req.body.enc);

 const { error } = validateGames(req.body);
 if (error) {
     return res.status(400).send(error.details[0].message);
 }

 const userid = req.user.userid;
 const exists = await redis.redishexists("userdata", userid);
 const user = await redis.redishget("userdata", userid);
 console.log("user",user)

 
 if (!exists) {
   return res.status(400).send('User not found');
 }
 
 const gameId = req.body.gameId;
 const betAmount = parseFloat(req.body.betAmount);
 const userGuess = req.body.userGuess;
 const game = await Queries.findOne({ gameId }, 'Game');
 if (!game) {
     return res.status(400).send({ message: 'Game not found' });
 }
 if (betAmount > user.balance) {
  return res.status(400).send('Insufficient balance for the bet');
}
const adminexists = await redis.redishexists(
  "adminControls",
    "Controls"
   );
   if (!adminexists) {
     return res.status(400).send("admincontrols not found");
   }
   const adminControls = await redis.redishget(
    "adminControls",
    "Controls");
   console.log("admincontrols",adminControls)

     const nextNumber = Math.floor(Math.random() * 21) + 1;
     const result =
         (userGuess === 'high' && nextNumber > game.Number) ||
         (userGuess === 'low' && nextNumber < game.Number) ||
         (userGuess === 'equal' && nextNumber === game.Number)
             ? 'win'
             : 'lose';

             const odds = parseFloat(adminControls.odds[userGuess]);
             if (!odds) {
                 return res.status(400).send('Invalid user guess');
             }
             const betid=generateId()
             const updatedGame = await Queries.findOneAndUpdate(
               { gameId: gameId },
               {
                   $set: {
                       userGuess: userGuess,
                       Number: nextNumber,
                       result: result,
                       gameId:betid
                   },
               },
               "Game",
               { new: true });
             
            
        if (!updatedGame) {
              return res.status(400).send('Error updating game');
        }
       
        const jobData = {
         userid:req.user.userid,
         betAmount: betAmount,
         userGuess: userGuess,
         betid:betid,
         odds:odds,
         result:result
       
         
     };

await addJob('update', jobData); 

const sortOptions = { _id: -1 };
       const limitValue = 1;
       const query = { gameId:betid};
       const gameHistory = await Queries.findSort(query, 'History', sortOptions, limitValue);

       const responseData = {
           status:result,
           Number: nextNumber,
           betid:betid
       };
         console.log("response",responseData);
       return res.status(200).send((responseData));
}));

module.exports = router;