var express = require('express');
var clients = express.Router();
var db = require('../db');

clients.get('/create',function(req, res){
  res.render('createClient');
});

clients.post('/create', function(req, res) {
  var clientData = {
    "name": req.body.name,
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "position": req.body.position,
  }

  db.create(db.MODE_TEST,'Clients',clientData,function(err,rows,pool){
    if(err){
      console.log(err);
    }
    else{
      res.redirect('/')
    }
    pool.end();
  });
});


clients.get('/getAll', function(req, res){
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
	  res.send(rows);
	}
	connection.end();
      });
    }
  });
});



module.exports = clients;
