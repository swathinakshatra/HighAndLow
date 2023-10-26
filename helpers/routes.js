const express = require('express');
const queue = require('express-queue');
const user=require('../routes/user');
const game=require('../routes/game');
const admin=require('../routes/Admin');
const admincontrols=require('../routes/admincontrols');
module.exports=function(app){
app.get('/', async (req, res) => {
return res.status(200).send('Welcome To High And Low Game')});
app.use(express.json());
app.use('/api/user',user,queue({activelimit:1,queuedlimit:-1}));
app.use('/api/game',game,queue({activelimit:1,queuedlimit:-1}));
app.use('/api/admin',admin,queue({activelimit:1,queuedlimit:-1}));
app.use('/api/admincontrols',admincontrols,queue({activelimit:1,queuedlimit:-1}));
}