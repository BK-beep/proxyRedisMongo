const express=require('express');
const redis=require('redis');
const axios=require('axios');
const mongoose=require('mongoose');
//get connection to database
const connectDB = require('./utils/database');
const router = require('./routes/routes');

const PORT=3000;
const REDIS_PORT=6379;

const client=redis.createClient(REDIS_PORT);

const app=express();
connectDB();

app.use(express.json());

const baseURL='https://jsonplaceholder.typicode.com';

app.use(express.static('static'));

let userSchema = new mongoose.Schema({
    id: Number,
    name: String,
    username: String,
    email: String,
    address: {
      street: String,
      suite: String,
      city: String,
      zipcode: String,
      geo: {
        lat: String,
        lng: String
      }
    },
    phone: String,
    website: String,
    company: {
      name: String,
      catchPhrase: String,
      bs: String
    }
  });
  const postsSchema = new mongoose.Schema({
    userId: Number,
    id: Number,
    title: String,
    body: String
  });
  const commentsSchema = new mongoose.Schema({
    postId: Number,
    id: Number,
    name: String,
    email: String,
    body: String,
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }]  
  });



async function request(req,res,next){
    try{
        const path=baseURL+req.originalUrl;
        const response=await axios.get(path);
        const data=await response.data;
        console.log(req.originalUrl);
        client.setex(req.originalUrl,69,JSON.stringify(data));



        res.send(data);
    }catch(err){
        console.log(err);
        res.status(500).send(err); 
    }
}

async function cache(req,res,next){
    try{
        client.get(req.originalUrl,(err,data)=>{
            if(err) console.error('Error executing command:', err);
            
            if(data!==null){
                console.log('cache'+" " +req.originalUrl);
                console.log('Command executed, Redis reply:');
                //set res header code to 304 and send data
                res.status(304).send(data);
            }else{
                next();
            }
        })
    }catch(err){
        console.log(err);
        res.status(500).send(err);
    }
}

app.use("/" , cache, router.router);

app.listen(PORT)