var express = require('express');
var users = express.Router();
var db = require('../db');
var cors = require('cors');
var pass = require('mysql-password');
var token;


var sess;


users.use(cors());

process.env.SECRET_KEY = 'veritest';

users.get('/all',function(req,res){
  sess = req.session

});

users.get('/register', function(req, res) {
  sess = req.session
  if(sess.admin){
    res.render('register');
  }
  else{
    req.flash('danger',"Unauthorized. You must be admin to access that page.");
    res.redirect('/');
  }
});

users.post('/register', function(req, res) {

  var userData = {
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "email": req.body.email,
    "password": pass(req.body.password),
    "address": req.body.address
  }

  db.create('Users',userData,function(err,rows,pool){
    if(err){
      console.log(err);
      req.flash('danger','Error. Registration was unsuccessful. Please try again.');
    }
    else{
      req.flash('success',"Success. User has been registered");
    }
    res.redirect('/')
  });

});


users.get('/login', function(req, res) {
  res.render('login');
});


users.post('/login', function(req, res) {

  var appData = {};
  var email = req.body.email;
  var password = req.body.password;

  db.query('SELECT * FROM Users WHERE email = ?', [email], function(err, rows, fields) {
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

	  req.flash('danger',"Error! Credentials not recognized");
	  res.redirect('/users/login');
	}
      } else {
	  req.flash('danger',"Error! Credentials not recognized");
	  res.redirect('/users/login');
      }
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

  sess = req.session
  if(sess.admin){
    var token = req.body.token || req.headers['token'];
    var appData = {};

    db.connect(db.MODE_TEST, function(err){
      if (err) {
	appData["error"] = 1;
	appData["data"] = "Internal Server Error";
	res.status(500).json(appData);
	db.get().end();
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
	db.get().end();
      }
    });
  }

  else{
    req.flash("Unauthorized. You must be admin to access that page.");
    res.redirect('/');
  }
});

module.exports = users;
