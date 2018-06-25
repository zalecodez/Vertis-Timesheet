var express = require('express');
var users = express.Router();
var db = require('../db');
var cors = require('cors');
var pass = require('mysql-password');
var token;

var sess;


/* GET users listing. */
users.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


users.use(cors());

process.env.SECRET_KEY = 'veritest';

users.get('/register', function(req, res) {
  res.render('register');
});
/*
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
*/

users.post('/register', function(req, res) {

  var userData = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "email": req.body.email,
    "password": pass(req.body.password),
    "address": req.body.address
  }

  db.create(db.MODE_TEST,'Users',userData,function(err,rows,pool){
    if(err){
      console.log(err);
    }
    else{
      res.redirect('/')
    }
    pool.end();
  });
});


users.get('/login', function(req, res) {
  res.render('login');
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
      connection.query('SELECT * FROM Users WHERE email = ?', [email], function(err, rows, fields) {
	if (err) {
	  console.log(err);
	  appData.error = 1;
	  appData["data"] = "Error Occured!";
	  res.status(400).json(appData);
	} else {
	  if (rows.length > 0) {
	    if (rows[0].password == pass(password)) {
	      console.log(rows[0])
	      row = Object.assign({},rows[0]);
	      appData.error = 0;

	      sess = req.session;
	      sess.email = row.email;
	      sess.firstname = row.firstname;
	      sess.lastname = row.lastname;
	      sess.address = row.address;
	      sess.userid = row.userid;
	      sess.admin = false;

	      if(row.email == 'admin@vertistest.com'){
		sess.admin = true;
	      }

	      res.redirect('/');

	    } else {
	      appData.error = 1;
	      appData["data"] = "Email and Password does not match";
	      res.status(204).json(appData);
	    }
	    connection.end();
	  } else {
	    console.log("no rows");
	    appData.error = 1;
	    appData["data"] = "Email does not exists!";
	    res.status(204).json(appData);
	  }
	}
      });
    }
  });
});

users.get('/logout', function(req, res) {
  req.session.destroy(function(err){
    if(err){
      console.log(err);
    }
    res.redirect('/');
  });
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
      connection.query('SELECT * FROM Users', function(err, rows, fields) {
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
