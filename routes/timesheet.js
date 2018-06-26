var express = require('express');
var timesheet = express.Router();
//var locus = require('locus');
var db = require('../db');
var sess;

timesheet.get('/', function(req, res, next) {
  sess = req.session;
  if(!sess.userid){
    res.redirect('/users/login');
  }
  else{
    db.query("SELECT * FROM Clients",function(err, rows, fields){ 
      if (err){
	console.log(err);
	res.send(err);
      }
      else{
	clients = rows;
	sess = req.session;
	db.query("SELECT *,HOUR(TIMEDIFF(end,start)) as hours, MINUTE(TIMEDIFF(end,start)) as minutes  FROM Periods WHERE userid="+sess.userid,function(err, rows, fields){
	  if (err){
	    console.log(err);
	    res.send(err);
	  }
	  else{
	    //periods = Object.assign({},rows);
	    periods = rows
	    getComments = function(periodid){
	      return new Promise((resolve,reject) => {
		db.query("SELECT Users.firstname,Users.lastname, Comments.comment, Comments.periodid, Comments.timestamp FROM Comments LEFT JOIN Users ON Comments.userid=Users.userid WHERE periodid="+periodid,function(err, rows, fields){
		  if (err){
		    reject(err);
		  }
		  else{
		    resolve(rows);
		  }
		});
	      });
	    }

	    //eval(locus);
	    comms = []
	    for(p in periods){
	      periodid = periods[p].periodid;
	      comms.push(getComments(periodid));
	    }

	    //eval(locus);
	    Promise.all(comms).then(function(values){

	      comments = {};
	      i=0;
	      for(p in periods){
		periodid = periods[p].periodid;
		comments[periodid]=values[i++];
	      }


	      //eval(locus);
	      res.render('timesheet',{
		firstname: sess.firstname,
		lastname: sess.lastname,
		email: sess.email,
		address: sess.address,
		clients: clients,
		periods: rows,
		comments: comments,
	      });
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


timesheet.post('/add',function(req, res){
  sess = req.session;
  data = {
    userid: sess.userid,
    clientid: req.body.clientid,
    title: req.body.title,
    start: req.body.date+' '+req.body.starttime,
    end: req.body.date+' '+req.body.endtime
  };

  db.create('Periods',data,function(err,rows,pool){
    if(err){
      console.log(err);
      req.flash('danger',"Error! Period not recorded. Please try again.");
      res.redirect('/');
    }
    else{
      if(req.body.comment && req.body.comment.trim() != ""){
	commentData={
	  userid: sess.userid,
	  periodid: rows.insertId,
	  comment: req.body.comment,
	  timestamp: new Date(),
	}

	db.create('Comments',commentData,function(err,rows, conn){
	  if(err){
	    console.log(err);
	    req.flash('danger',"Error! Period not recorded. Please try again.");
	    res.redirect('/');
	  }
	  else{
	    req.flash('success','Success! Period successfully recorded.');
	    res.redirect('/');
	  }
	});
      }
      else{
	    req.flash('success','Success! Period successfully recorded.');
	    res.redirect('/');
      }
    }
  });
});


timesheet.post('/addComment',function(req, res){
  sess = req.session;
  if(req.body.comment && req.body.comment.trim() != ""){
    commentData={
      userid: sess.userid,
      periodid: req.body.periodid,
      comment: req.body.comment,
      timestamp: new Date(),
    }

    db.create('Comments',commentData,function(err,rows, conn){
      if(err){
	console.log(err);
	req.flash('danger','Error! Comment not added. Please try again.');
	res.redirect('/timesheet');
      }
      else{
	req.flash('success','Success! Comment posted.');
	res.redirect('/timesheet');
      }
    });
  }
  else{
	req.flash('danger','Error! Comment not added. Please try again.');
	res.redirect('/timesheet');
  }
});

module.exports = timesheet
