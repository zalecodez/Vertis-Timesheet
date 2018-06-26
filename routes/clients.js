var express = require('express');
var clients = express.Router();
var db = require('../db');
var sess;

clients.get('/create',function(req, res){
  sess = req.session

  if(sess.admin){
    res.render('createClient');
  }
  else{
    req.flash('danger','Unauthorized. You must be admin to access that page');
    res.redirect('/');
  }
});

clients.post('/create', function(req, res) {
  var clientData = {
    "name": req.body.name,
    "firstname": req.body.firstname,
    "lastname": req.body.lastname,
    "position": req.body.position,
  }

  db.create('Clients',clientData,function(err,rows,pool){
    if(err){
      console.log(err);
      req.flash('danger','Error. Registration was unsuccessful. Please try again.');
    }
    else{
      req.flash('success',"Success. Client has been registered.");
    }
    res.redirect('/');
  });
});


clients.get('/getAll', function(req, res){
  db.query("SELECT * FROM Clients",function(err, rows, fields){
    if (err){
      console.log(err);
      res.send(err);
    }
    else{
      res.send(rows);
    }
  });
});



module.exports = clients;
