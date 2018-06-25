var express = require('express');
var timesheet = express.Router();
//var locus = require('locus');
var db = require('../db');
var sess;

timesheet.get('/', function(req, res, next) {
  db.connect(db.MODE_TEST, function(err){
    if (err){
      console.log(err);
      res.send(err);
      db.get().end();
    }
    else{
      connection = db.get();
      connection.query("SELECT * FROM Clients",function(err, rows, fields){ 
	//eval(locus);
	connection.end();
	//eval(locus);
	if (err){
	  console.log(err);
	  res.send(err);
	}
	else{
	  clients = rows;
	  db.connect(db.MODE_TEST, function(err){
	    if (err){
	      console.log(err);
	      res.send(err);
	    }
	    else{
	      sess = req.session;
	      connection = db.get();
	      connection.query("SELECT *,HOUR(TIMEDIFF(end,start)) as hours, MINUTE(TIMEDIFF(end,start)) as minutes  FROM Periods WHERE userid="+sess.userid,function(err, rows, fields){
		//eval(locus);
		connection.end();
		//eval(locus);
		if (err){
		  console.log(err);
		  res.send(err);
		}
		else{
		  //periods = Object.assign({},rows);
		  periods = rows
		  getComments = function(periodid){
		    return new Promise((resolve,reject) => {
		      db.connect(db.MODE_TEST, function(err,rows,pool){
			if(err){
			  console.log(err);
			  res.send(err);
			  pool.end();
			}

			else{
			  connection = db.get()
			  connection.query("SELECT Users.firstname,Users.lastname, Comments.comment, Comments.periodid FROM Comments LEFT JOIN Users ON Comments.userid=Users.userid WHERE periodid="+periodid,function(err, rows, fields){
			    //eval(locus);
			    connection.end();
			    //eval(locus);
			    if (err){
			      reject(err);
			    }
			    else{
			      resolve(rows);
			    }
			  });
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

  db.create(db.MODE_TEST,'Periods',data,function(err,rows,pool){
    if(err){
      console.log(err);
      req.flash('danger',"Error! Period not recorded. Please try again.");
      res.redirect('/');
    }
    else{
      commentData={
	userid: sess.userid,
	periodid: rows.insertId,
	comment: req.body.comment
      }

      db.create(db.MODE_TEST,'Comments',commentData,function(err,rows, conn){
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
  });
});

module.exports = timesheet
