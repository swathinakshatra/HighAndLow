router.post('/guesss', ratelimiter, auth, amw(async (req, res) => {
    const decrypted = crypto.decryptobj(req.body.enc);
    
    const { error } = validateGames(decrypted);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    
    const user = await Queries.findOne({ userid: req.user.userid }, "User");
    if (!user) {
        return res.status(400).send('User not found');
    }

    const gameId = decrypted.gameId;
    const betAmount = parseFloat(decrypted.betAmount);
    const userGuess = decrypted.userGuess;

    const game = await Queries.findOne({ gameId }, 'Game');
    if (!game) {
        return res.status(400).send({ message: 'Game not found' });
    }

  
    if (user.balance < betAmount) {
        return res.status(400).send('Insufficient balance for the bet');
    }

    const adminControls = await Queries.findOne({}, 'AdminControls');
    if (!adminControls) {
        return res.status(400).send('Admin controls not found');                        
    }

    const odds = parseFloat(adminControls.odds[userGuess]);
    if (!odds) {
        return res.status(400).send('Invalid user guess');
    }

    const nextNumber = Math.floor(Math.random() * 21) + 1;
    const result = (userGuess === 'high' && nextNumber > game.Number) ||
                   (userGuess === 'low' && nextNumber < game.Number) ||
                   (userGuess === 'equal' && nextNumber === game.Number) ? 'win' : 'lose';

    
    const updatedBalance = (parseFloat(user.balance) - betAmount).toFixed(2);

 await Queries.findOneAndUpdate(
        { userid: req.user.userid },
        { $set: { balance: updatedBalance } },"User",
        { new: true }
    );


    let amountWon = 0;
   
    if (result === 'win') {
        amountWon = (betAmount * odds).toFixed(2);
        const updatedUser = await Queries.findOneAndUpdate(
            { userid: req.user.userid },
            { $set: { balance: (parseFloat(updatedBalance) + parseFloat(amountWon)).toFixed(2) } },"User",
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).send('Error updating user balance');
        }
    }

    
    const updatedGameId = generateId();
    const updatedGame = await Queries.findOneAndUpdate(
        { gameId: gameId },
        {
            $set: {
                userGuess: userGuess,
                Number: nextNumber,
                result: result,
                gameId: updatedGameId
            }
        },
        "Game",
        { new: true }
    );

    if (!updatedGame) {
        return res.status(400).send('Error updating game');
    }
    const historyData = {
        time: moment().format('MM-DD-YYYY h:mm A'),
        betid: generateId(), 
        userid: req.user.userid,
        name: req.user.name, 
        odds: adminControls.odds[userGuess], 
        betPlacedOn: userGuess,
        betAmount: betAmount, 
        status: result === 'win' ? 'Win' : 'Lose',
        Note: "game",
    };

   
    const history = await Queries.insert("History",historyData);

    if (!history) {
        return res.status(400).send('Error saving bet history');
    }

    return res.status(200).send(crypto.encryptobj({
        currentNumber: updatedGame.Number,
        result: updatedGame.result,
        userGuess: updatedGame.userGuess,
        gameId: updatedGame.gameId,
        userBalance: (parseFloat(updatedBalance) + parseFloat(amountWon)).toFixed(2),
        debited: (parseFloat(updatedBalance) - parseFloat(betAmount)).toFixed(2),
        amountWon:amountWon
    }));
}));

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
 
    return res.status(200).send({historydata,user});
}));
router.post('/guesss', auth, amw(async (req, res) => {
    //const decrypted = crypto.decryptobj(req.body.enc);
 
  const { error } = validateGames(req.body);
  if (error) {
      return res.status(400).send(error.details[0].message);
  }

  const user = await Queries.findOne({ userid: req.user.userid }, "User");
  if (!user) {
      return res.status(400).send('User not found');
  }
  const gameId = req.body.gameId;
  const betAmount = parseFloat(req.body.betAmount);
  const userGuess = req.body.userGuess;
  const game = await Queries.findOne({ gameId }, 'Game');
  if (!game) {
      return res.status(400).send({ message: 'Game not found' });
  }




 
  if (user.balance < betAmount) {
      return res.status(400).send('Insufficient balance for the bet');
  }
 const adminexists = await redis.redishexists(
      "adminscontrols",
      "Adminscontrols"
    );
    if (!adminexists) {
      return res.status(400).send("admincontrols not found");
    }
    const adminControls = await redis.redishget(
      "adminscontrols",
      "Adminscontrols"
    );
      const nextNumber = Math.floor(Math.random() * 21) + 1;
      let result = 'lose';

      if (
          (userGuess === 'high' && nextNumber > game.Number) ||
          (userGuess === 'low' && nextNumber < game.Number) ||
          (userGuess === 'equal' && nextNumber === game.Number)
      ) {
          result = 'win';
      }
            

  const odds = parseFloat(adminControls.odds[userGuess]);
  if (!odds) {
      return res.status(400).send('Invalid user guess');
  }
 
const jobData = {
      userGuess: userGuess,
      gameId:gameId,
      betAmount: betAmount,
      odds: odds,
      user: user,
      game: game,
      adminControls: adminControls,
      betid:generateId(),
      userid:req.user.userid,
      result:result,
      current:nextNumber
      
  };

await addJob('update', jobData, {priority:1}); 



const sortOptions = { _id: -1 };
        const limitValue = 1;
        const query = { gameId: jobData.betid };
        const gameHistory = await Queries.findSort(query, 'History', sortOptions, limitValue);
           console.log("gameHistory",gameHistory)
        const responseData = {
            status: result,
            Number: nextNumber,
            betid:jobData.betid
        };
         
        return res.status(200).send((responseData));
  
      
   
 


}));
// router.post('/starts',ratelimiter,auth,amw(async (req, res) => {
//     const user=await Queries.findOne({userid:req.user.userid},"User") ;
//     if(!user) return res.status(400).send('user not found')
//      const randomNumber = Math.floor(Math.random() *21) + 1;
//     const gameId = generateId();
//     const newdata={
//       gameId:gameId,
//       Number:randomNumber,
//       userGuess: null, 
//       result: 'Pending'
//     }
    
//     const insert=await Queries.insert('Game',newdata);
//     if(!insert) return res.status(400).send('error in insert');

//     return res.status(200).send(({ message: 'Game started!', number: randomNumber ,gameId:gameId,userBalance:user.balance}));
//   }));
 
// router.post('/guesss', ratelimiter, auth, amw(async (req, res) => {
  
   
//     const { error } = validateGames(req.body);
//     if (error) {
//         return res.status(400).send(error.details[0].message);
//     }

//     const user = await Queries.findOne({ userid: req.user.userid }, "User");
//     if (!user) {
//         return res.status(400).send('User not found');
//     }

//     const gameId = req.body.gameId;
//     const betAmount = parseFloat(req.body.betAmount);
//     const userGuess = req.body.userGuess;

//     const game = await Queries.findOne({ gameId }, 'Game');
//     if (!game) {
//         return res.status(400).send({ message: 'Game not found' });
//     }

//     if (user.balance < betAmount) {
//         return res.status(400).send('Insufficient balance for the bet');
//     }

//     const adminexists = await redis.redishexists(
//         "adminscontrols",
//         "Adminscontrols"
//       );
//       if (!adminexists) {
//         return res.status(400).send("admincontrols not found");
//       }
//       const adminControls = await redis.redishget(
//         "adminscontrols",
//         "Adminscontrols"
//       );

//     const odds = parseFloat(adminControls.odds[userGuess]);
//     if (!odds) {
//         return res.status(400).send('Invalid user guess');
//     }

    
//     const jobData = {
//         userGuess: userGuess,
//         gameId: gameId,
//         betAmount: betAmount,
//         odds: odds,
//         user: user,
//         game: game,
//         adminControls: adminControls
//     };
//    await addJob('update', jobData, {priority:1}); 
//    const data = await processUpdateJob(jobData);
//    return res.status(200).send((data));

// }));



router.post('/starts',auth,amw(async (req, res) => {
    const user=await Queries.findOne({userid:req.user.userid},"User") ;
    if(!user) return res.status(400).send('user not found')
     const randomNumber = Math.floor(Math.random() *21) + 1;
    const gameId = generateId();
    const newdata={
      gameId:gameId,
      Number:randomNumber,
      userGuess: null, 
      result: 'Pending'
    }
    
    const insert=await Queries.insert('Game',newdata);
    if(!insert) return res.status(400).send('error in insert');

    return res.status(200).send(({ message: 'Game started!', number: randomNumber ,gameId:gameId,userBalance:user.balance}));
  }));

  router.post('/starts',auth,amw(async (req, res) => {
    const user=await Queries.findOne({userid:req.user.userid},"User") ;
    if(!user) return res.status(400).send('user not found')
     const randomNumber = Math.floor(Math.random() *21) + 1;
    const gameId = generateId();
    const newdata={
      gameId:gameId,
      Number:randomNumber,
      userGuess: null, 
      result: 'Pending'
    }
    
    const insert=await Queries.insert('Game',newdata);
    if(!insert) return res.status(400).send('error in insert');

    return res.status(200).send(({ message: 'Game started!', number: randomNumber ,gameId:gameId,userBalance:user.balance}));
  }));


  router.post('/guessss',auth, amw(async (req, res) => {
      const decrypted = crypto.decryptobj(req.body.enc);
   
    const { error } = validateGames(decrypted);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const user = await Queries.findOne({ userid: req.user.userid }, "User");
    if (!user) {
        return res.status(400).send('User not found');
    }
    const gameId = decrypted.gameId;
    const betAmount = parseFloat(decrypted.betAmount);
    const userGuess = decrypted.userGuess;
    const game = await Queries.findOne({ gameId }, 'Game');
    if (!game) {
        return res.status(400).send({ message: 'Game not found' });
    }
   if (user.balance < betAmount) {
        return res.status(400).send('Insufficient balance for the bet');
    }
   const adminexists = await redis.redishexists(
        "adminscontrols",
        "Adminscontrols"
      );
      if (!adminexists) {
        return res.status(400).send("admincontrols not found");
      }
      const adminControls = await redis.redishget(
        "adminscontrols",
        "Adminscontrols"
      );
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
  const jobData = {
        userGuess: userGuess,
        gameId:gameId,
        betAmount: betAmount,
        odds: odds,
        user: user,
        game: game,
        adminControls: adminControls,
        betid:generateId(),
        userid:req.user.userid,
        result:result
        
    };
await addJob('update', jobData, {priority:1}); 




const timeoutDuration = 2000; 

setTimeout(async () => {
    try {
      const sortOptions = { _id: -1 }; 
      const limitValue = 1;
      const query = { gameId: betid}; 
      const gameHistory = await Queries.findSort(query, 'History', sortOptions, limitValue);
      console.log('Game History:', gameHistory);
      
      if (gameHistory.length > 0) {
        return res.status(200).send(crypto.encryptobj(gameHistory));
      } else {
        return res.status(200).send('No game history found');
      }
    } catch (error) {
      console.error('Error retrieving game history:', error);
      
    }
  }, timeoutDuration);
//return res.status(200).send(result)

}));



const Queries = require('../helpers/mongofunctions');
const redis = require('../helpers/redis');


async function processUpdateJob(jobData) {
    try {
        const { userid, betAmount, userGuess,
             result, odds, betid } = jobData;

        const user = await Queries.findOne({ userid: userid }, "User");
        console.log("user", user);
        if (user){

        let amountWon = "0";
        const admincontrols = await Queries.findOne({}, "AdminControls");
        if (admincontrols) {

       const updatedBalance = (parseFloat(user.balance) - betAmount).toFixed(2);
       const debited=await Queries.findOneAndUpdate(
        { userid:userid },
        { $set: { balance: updatedBalance } },
        "User",
        { new: true }
    );
      
     
      const userexists=await redis.redishexists("userdata",userid);
      console.log("userexists",userexists);
      const userdata=await redis.redishget("userdata",userid);
      console.log("mongodebiteddebited",debited)
      console.log("beforeredis",userdata);
    const redisdebited=await redis.redisupdate("userdata",userdata.userid,JSON.stringify(debited))
    const getdata=await redis.redishget("userdata",userid);
    console.log("afterdebited",getdata)
    console.log("redisdebited",redisdebited)

        if (result === 'win') {
         
            amountWon = (betAmount * (odds / 100) + betAmount).toFixed(2);
            const updatedBalanceWithWin = (parseFloat(updatedBalance) + parseFloat(amountWon)).toFixed(2);

            
            const updatedUser = await Queries.findOneAndUpdate(
                { userid: userid },
                {
                    $set: {
                        balance: updatedBalanceWithWin,
                    },
                },
                "User",
                { new: true }
            );
            
            console.log("updatedUser in MongoDB", updatedUser);

          
            if (updatedUser) {
              
             
                const userExists=await redis.redishexists("userdata",userid);
                console.log("userExists",userExists);
                const userData=await redis.redishget("userdata",userid);
                console.log("userDats",userData);
           
            const updatedUserString = JSON.stringify(updatedUser);
            const update = await redis.redisupdate("userdata", userData.userid,updatedUserString);
            console.log("Redis update result: ", update);
            const updategetdatas=await redis.redishget("userdata",userid);
            console.log("updategetdatas",updategetdatas)
        }

        const historyData = {
            time: Date.now(),
            betid: betid,
            userid: userid,
            name: user.name,
            odds: odds,
            betPlacedOn: userGuess,
            debited: (parseFloat(user.balance) - betAmount).toFixed(2),
            amountWon: amountWon,
            betAmount: betAmount,
            status: result === 'win' ? 'Win' : 'Lose',
            Note: 'game',
        };

        const history = await Queries.insert("History", historyData);
        console.log("history", history);
    
        if (!history) {
            throw new Error('Error saving bet history');
        }
    }}}
        return 'Job completed successfully';
    } catch (error) {
        throw error;
    }
}



router.post('/start', auth, amw(async (req, res) => {
    const userid = req.user.userid;
    const exists = await redis.redishexists("userdata", userid);
    const user = await redis.redishget("userdata", userid);
    console.log("user",user)
    const userbalance=JSON.parse(user)
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
      userBalance:userbalance.balance
  
    }));
  }));



  router.post('/startsss', auth, amw(async (req, res) => {
    const userid = req.user.userid;
    const exists = await redis.redisexists(userid);
  
    if (!exists) {
    
      const userdata = await Queries.findOneDocument({ userid }, "User");
  
      if (!userdata) {
        return res.status(400).send('User not found in MongoDB');
      }
  
    
      const redisData = await redis.redisSETEX(userid, 30, JSON.stringify(userdata));
  
      if (!redisData) {
        return res.status(400).send('Failed to save data in Redis');
      }
  
      console.log("Data from MongoDB:", userdata);
    }
  
   
    const user = await redis.redisget(userid);
    console.log("User from Redis:", user);
  
    
    const randomNumber = Math.floor(Math.random() * 21) + 1;
    const gameId = generateId();
    const newdata = {
      gameId: gameId,
      Number: randomNumber,
      userGuess: null,
      result: 'Pending'
    };
  
    const insert = await Queries.insert('Game', newdata);
  
    if (!insert) {
      return res.status(400).send('Error in insert');
    }
  
    return res.status(200).send({
      message: 'Game started!',
      number: randomNumber,
      gameId: gameId,
      userBalance: user.balance 
    });
  }));
  router.post('/guesssss', auth, amw(async (req, res) => {
   
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
  if (user.balance < betAmount) {
       return res.status(400).send('Insufficient balance for the bet');
   }
  const adminexists = await redis.redishexists(
   "control",
   "AdminsControl"
     );
     if (!adminexists) {
       return res.status(400).send("admincontrols not found");
     }
     const adminControls = await redis.redishget(
       "control",
     "AdminsControl");
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
        await Queries.findSort(query, 'History', sortOptions, limitValue);
  
         const responseData = {
             status:result,
             Number: nextNumber,
             betid:betid
         };
           console.log("response",responseData);
         return res.status(200).send(crypto.encryptobj(responseData));
  }));
  
  
router.post('/guesss', auth, amw(async (req, res) => {
   
  //const decrypted = crypto.decryptobj(req.body.enc);

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
if (user.balance < betAmount) {
     return res.status(400).send('Insufficient balance for the bet');
 }
const adminexists = await redis.redishexists(
 "control",
 "AdminsControl"
   );
   if (!adminexists) {
     return res.status(400).send("admincontrols not found");
   }
   const adminControls = await redis.redishget(
     "control",
   "AdminsControl");
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

router.post('/guessss', auth, amw(async (req, res) => {
   
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
if (user.balance < betAmount) {
      return res.status(400).send('Insufficient balance for the bet');
  }
 const adminexists = await redis.redishexists(
  "controls",
  "AdminsControl"
    );
    if (!adminexists) {
      return res.status(400).send("admincontrols not found");
    }
    const adminControls = await redis.redishget(
      "controls",
    "AdminsControl");

      const nextNumber = Math.floor(Math.random() * 21) + 1;
      const result =
          (userGuess === 'high' && nextNumber > game.Number) ||
          (userGuess === 'low' && nextNumber < game.Number) ||
          (userGuess === 'equal' && nextNumber === game.Number)
              ? 'win'
              : 'lose';

              const odds = parseFloat(JSON.parse(adminControls).odds[userGuess]);
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
          odds:odds
          
      };

await addJob('update', jobData); 

const sortOptions = { _id: -1 };
        const limitValue = 1;
        const query = { gameId:gameId};
        const gameHistory = await Queries.findSort(query, 'History', sortOptions, limitValue);
console.log("gamehistory",gameHistory)
        const responseData = {
            status: result,
            Number: nextNumber,
            betid:jobData.betid
        };
          console.log("response",responseData);
        return res.status(200).send(crypto.encryptobj(responseData));
}));


router.post('/user',  amw(async (req, res) => {
   
 
  // const { error } = validateGames(req.body);
  // if (error) {
  //     return res.status(400).send(error.details[0].message);
  // }
    const userid=req.body.userid
    const exists = await redis.redishexists("userdata",userid);
  const user = await redis.redishget("userdata",userid);
  if (!exists) {
      return res.status(400).send('User not found');
  }
  else{
    return res.status(200).send(user)
  }
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
router.post('/updatebal',amw(async(req,res)=>{
  const userid=req.body.userid
  const user=await Queries.findOne({userid:req.body.userid},"User")
  if(!user) return res.status(400).send("User not  found in mongo")
  const updatedUser = await Queries.findOneAndUpdate(
      { userid: userid },
      { $set: { balance: 50} },
      "User",
      { new: true });
      if(!updatedUser) return res.status(400).send('bal update failed')
      console.log("updateduser",updatedUser)
  const redisget=await redis.redishget("userdata",userid);
  if(!redisget) return res.status(400).send("user not  found in redis")
      const redisupdate=await redis.redishset("userdata",userid,JSON.stringify(updatedUser))
      console.log("redisupdate",redisupdate);
      return res.status(200).send("balance updated successfully")

}))





  

module.exports = processUpdateJob;

