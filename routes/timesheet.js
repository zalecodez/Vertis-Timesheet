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
	  db.connect(db.MODE_TEST, function(err){
	    if (err){
	      console.log(err);
	      res.send(err);
	    }
	    else{
	      connection = db.get();
	      connection.query("SELECT *,HOUR(TIMEDIFF(end,start)) as hours, MINUTE(TIMEDIFF(end,start)) as minutes  FROM Periods WHERE userid="+sess.userid,function(err, rows, fields){
		if (err){
		  console.log(err);
		  res.send(err);
		}
		else{
		  //periods = Object.assign({},rows);
		  periods = rows
		  function getComments(periodid){
		    connection = db.get()
		    return new Promise((resolve,reject) => {

		      connection.query("SELECT Users.firstname,Users.lastname, Comments.comment, Comments.periodid FROM Comments LEFT JOIN Users ON Comments.userid=Users.userid WHERE periodid="+periodid,function(err, rows, fields){
			if (err){
			  reject(err);
			}
			else{
			  resolve(rows);
			}
		      });
		    });
		  }

		  comms = []
		  for(p in periods){
		    periodid = periods[p].periodid;
		    comms.push(getComments(periodid));
		  }

		  Promise.all(comms).then(function(values){

		    comments = {};
		    i=0;
		    for(p in periods){
		      periodid = periods[p].periodid;
		      comments[periodid]=values[i++];
		    }


		    res.render('timesheet',{
		      firstname: sess.firstname,
		      lastname: sess.lastname,
		      email: sess.email,
		      address: sess.address,
		      clients: clients,
		      periods: rows,
		      comments: comments,
		    });

		    connection.end()
		  },
		  function(error){
		    console.log(error);
		  });
		}
	      });
	    }
	  });
	}
      });
    }
  });
});


timesheet.post('/add',function(req, res){
  sess = req.session;
  data = {
    userid: sess.userid,
    clientid: req.body.clientid,
    title: req.body.title,
    start: req.body.date+' '+req.body.starttime,
    end: req.body.date+' '+req.body.endtime
  };

  db.create(db.MODE_TEST,'Periods',data,function(err,rows){
    if(err){
      console.log(err);
      res.send(err);
    }
    else{
      commentData={
	userid: sess.userid,
	periodid: rows.insertId,
	comment: req.body.comment
      }

      db.create(db.MODE_TEST,'Comments',commentData,function(err,rows){
	if(err){
	  console.log(err);
	  res.send(err);
	}
	else{
	  res.redirect('/')
	}
      });
    }
  });
});

module.exports = timesheet
