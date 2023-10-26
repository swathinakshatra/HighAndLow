const Queries = require('../helpers/mongofunctions');
const redis = require('../helpers/redis');

async function processUpdateJob(jobData) {
    try {
        const { userid, betAmount, userGuess, result,betid } = jobData;

        const user = await Queries.findOne({ userid: userid }, "User");
       
        if (user){
            const adminControls = await Queries.findOne({},"AdminControls");
            
        if(adminControls){
            const odds = parseFloat(adminControls.odds[userGuess]);
        const debitedBalance = parseFloat((user.balance - betAmount).toFixed(2));

        
        const updatedUser = await Queries.findOneAndUpdate(
            { userid: userid },
            { $set: { balance: debitedBalance} },
            "User",
            { new: true }
        );
        console.log("updateduser",updatedUser)

        let amountWon = 0;
        if (result === 'win') {
          
            amountWon = parseFloat((betAmount * (odds / 100) + betAmount).toFixed(2));

            console.log("UserID:", userid);
            const updatebalance = await Queries.findOneAndUpdate(
              { userid: userid },
              { $inc: { balance:amountWon} },
              "User",
              { new: true }
            );

            console.log("updatedbalance", updatebalance);

           
            const redisUpdatedUser = await redis.redishset("userdata", userid, JSON.stringify(updatebalance));
            console.log("Redis updated user:", redisUpdatedUser);
        } else {
            
            const redisUpdatedUser = await redis.redishset("userdata", userid, JSON.stringify(updatedUser));
            console.log("Redis updated user (loss):", redisUpdatedUser);
        }

    
        const historyData = {
            time: Date.now(),
            betid:betid,
            userid: userid,
            name: user.name,
            odds: odds,
            betPlacedOn: userGuess,
            debited: debitedBalance,
            amountWon: amountWon,
            betAmount: betAmount,
            status: result,
            Note: 'game',
        };

        const history = await Queries.insert("History", historyData);
        console.log("history", history);
    }}

        return 'Job completed successfully';
    } catch (error) {
        throw error;
    }
}

module.exports = processUpdateJob;