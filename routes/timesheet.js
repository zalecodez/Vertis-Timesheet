var express = require('express');
var request = require('request');
var timesheet = express.Router();

var db = require('../db');
var sess;

timesheet.get('/', function(req, res, next) {
  db.connect(db.MODE_TEST, function(err){
    if (err){
      console.log(err);
      res.send(err);
    }
    else{
      connection = db.get();
      
      connection.query("SELECT * FROM Clients",function(err, rows, fields){
	if (err){
	  console.log(err);
	  res.send(err);
	}
	else{

	  clients = rows;

	  sess = req.session;
	  res.render('timesheet',{
	    firstname: sess.firstname,
	    lastname: sess.lastname,
	    email: sess.email,
	    address: sess.address,
	    clients: clients
	  });
	}
      });
    }
  });
});


timesheet.post('/add',function(req, res){
  data = {
    userid: sess.userid,
    clientid: req.body.clientid,
    title: req.body.title,
    start: req.body.start,
    end: req.body.end
  };

  db.create(db.MODE_TEST,'Periods',data,function(err){
    if(err){
      console.log(err);
    }
    else{
      res.redirect('/')
    }
  });

});

module.exports = timesheet
