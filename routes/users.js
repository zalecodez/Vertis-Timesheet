var express = require('express');
var users = express.Router();
var db = require('../db');
var cors = require('cors');
var jwt = require('jsonwebtoken');
var pass = require('mysql-password');
var token;

/* GET users listing. */
users.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


users.use(cors());

process.env.SECRET_KEY = 'veritest';

users.get('/register', function(req, res) {
  res.render('register');
});

users.post('/register', function(req, res) {

  var today = new Date();
  var appData = {
    "error": 1,
    "data": ""
  };
  var userData = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "email": req.body.email,
    "password": pass(req.body.password),
    "address": req.body.address
  }


  db.connect(db.MODE_TEST, function(err){
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      console.log(db.get());
      connection = db.get();

      connection.query('INSERT INTO Users SET ?', userData, function(err, rows, fields) {
	if (!err) {
	  appData.error = 0;
	  appData["data"] = "User registered successfully!";
	  res.status(201).json(appData);
	} else {
	  console.log(err)
	  appData["data"] = "Error Occured!";
	  res.status(400).json(appData);
	}
      });
    }
  });
});
users.post('/login', function(req, res) {

  var appData = {};
  var email = req.body.email;
  var password = req.body.password;

  db.connect(db.MODE_TEST, function(err){
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection = db.get();
      connection.query('SELECT * FROM users WHERE email = ?', [email], function(err, rows, fields) {
	if (err) {
	  appData.error = 1;
	  appData["data"] = "Error Occured!";
	  res.status(400).json(appData);
	} else {
	  if (rows.length > 0) {
	    if (rows[0].password == password) {
	      token = jwt.sign(rows[0], process.env.SECRET_KEY, {
		expiresIn: 5000
	      });
	      appData.error = 0;
	      appData["token"] = token;
	      res.status(200).json(appData);
	    } else {
	      appData.error = 1;
	      appData["data"] = "Email and Password does not match";
	      res.status(204).json(appData);
	    }
	  } else {
	    appData.error = 1;
	    appData["data"] = "Email does not exists!";
	    res.status(204).json(appData);
	  }
	}
      });
      connection.release();
    }
  });
}); 

users.use(function(req, res, next) {
  var token = req.body.token || req.headers['token'];
  var appData = {};
  if (token) {
    jwt.verify(token, process.env.SECRET_KEY, function(err) {
      if (err) {
	appData["error"] = 1;
	appData["data"] = "Token is invalid";
	res.status(500).json(appData);
      } else {
	next();
      }
    });
  } else {
    appData["error"] = 1;
    appData["data"] = "Please send a token";
    res.status(403).json(appData);
  }
});

users.get('/getUsers', function(req, res) {

  var token = req.body.token || req.headers['token'];
  var appData = {};

  db.connect(db.MODE_TEST, function(err){
    if (err) {
      appData["error"] = 1;
      appData["data"] = "Internal Server Error";
      res.status(500).json(appData);
    } else {
      connection = db.get();
      connection.query('SELECT * FROM users', function(err, rows, fields) {
	if (!err) {
	  appData["error"] = 0;
	  appData["data"] = rows;
	  res.status(200).json(appData);
	} else {
	  appData["data"] = "No data found";
	  res.status(204).json(appData);
	}
      });
      connection.release();
    }
  });
});

module.exports = users;
