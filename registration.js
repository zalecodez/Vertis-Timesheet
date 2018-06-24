var express = require('express');
var users = express.Router();
var database = require('./db.js');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var token;

users.use(cors());

process.env.SECRET_KEY = 'veritest';

users.post('/register',function(req, res){
  var today = new Date();
  var appData = {
    "error": 1,
    "data": ""
  };
  var userData = {
    'email': req.body.email,
    'password': req.body.password,
    'firstname': req.body.firstname,
    'lastname': req.body.lastname,
    'address': req.body.address
  }

 
//connect to mysql on start
db.connect(db.MODE_TEST, function(err){
  if(err){
    console.log('Unable to connect to MySQL.')
    process.exit(1);
  }
  else{
    console.log(db.get());

  }
});

