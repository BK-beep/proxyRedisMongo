const router = require('express').Router();
const mongoose = require('mongoose');
const { User } = require('../models/userModel');
const redis=require('redis');


const client=redis.createClient(6379);
//ffff
router.get('/users', async (req, res) => {
    //get users from database
    const users = await User.find();
    client.setex(req.originalUrl,69,JSON.stringify(users));
    res.send(users);
}
);



exports.router = router;
