var express = require('express');
var comments = express.Router();

var db = require('../db');
var sess;



comments.get('/', function(req, res, next) {
  db.connect(db.MODE_TEST, function(err){
    if (err){
      console.log(err);
      res.send(err);
    }
    else{
      periodid = req.query.periodid;
      connection = db.get();
      connection.query("SELECT * FROM Comments WHERE periodid="+periodid,function(err, rows, fields){ 
	if (err){
	  console.log(err);
	  res.send(err);
	}
	else{
	  comments = rows;
	  res.send(comments);
	}
	connection.end();
      });
    }
  });
});


module.exports = comments;
