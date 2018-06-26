var mysql = require('mysql');
var async = require('async');
var pass = require('mysql-password');

var pool = mysql.createPool(process.env.CLEARDB_DATABASE_URL || {
  host: 'localhost',
  user: 'web',
  password: 'verTis~23',
  database: 'vertis2',
});

exports.connect = function(done){
  pool.getConnection(function(err, connection){
    if(err){
      return done(err);
    }
    else{
      done(err, connection);
    }
  });
}

exports.get = function(){
  return pool;
}

exports.create = function(table, data, done){
  exports.connect(function(err, connection){
    if (err) {
      done(err);
    }
    else{
      connection.query('INSERT INTO '+table+' SET ?', data, function(err, rows, fields) {
	connection.release();
	if (!err) {
	  console.log("Success");
	} else {
	  console.log(err);
	}
	done(false, rows);
      });
    }
  });
};

exports.query = function(query, data, done){
  exports.connect(function(err, connection){
    if(err){
      done(err);
    }
    else{
      connection.query(query, data, function(err, rows, fields){
	connection.release();
	if(err){
	  done(err);
	}
	else{
	  done(false, rows, fields)
	}
      });
    }
  });
};

exports.drop = function(tables, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  async.each(tables, function(name, cb) {
    pool.query('DELETE * FROM ' + name, cb);
  }, done);
}


exports.initdb = function(done){
  exports.query("SELECT 1 FROM Comments, Users, Clients, Periods LIMIT 1", [], function(err, rows, fields){
    if(err){
      createUsers = new Promise((resolve, reject) => {
	exports.query("CREATE TABLE Users(userid int not null primary key auto_increment, email varchar(100) not null unique, firstname varchar(100) not null, lastname varchar(100) not null, address varchar(255), password varchar(255) not null)", [], function(err,rows,fields){
	  var userData = {
	    "firstname": "Admin", 
	    "lastname": "Admin",
	    "email": "admin@vertistest.com",
	    "password": pass("admin"),
	    "address": "Seymore Park",
	  }
	  exports.create("Users",userData,function(err, rows, fields){
	    if(err){
	      reject(err);
	    }
	    else{
	      resolve();
	    }
	  });
	});
      });


      createClients = new Promise((resolve, reject) => {
	exports.query("CREATE TABLE Clients(clientid int not null primary key auto_increment, name varchar(100) not null, firstname varchar(100) not null, lastname varchar(100) not null, position varchar(255) not null)", [], function(err,rows,fields){
	  if (err){
	    reject(err);
	  }
	  else{
	    resolve();
	  }
	});
      });


      createPeriods = new Promise((resolve, reject) => {
	exports.query("CREATE TABLE Periods(userid int not null, foreign key (userid) references Users(userid), clientid int not null, foreign key (clientid) references Clients(clientid), periodid int not null primary key auto_increment, title varchar(255) not null, start datetime not null, end datetime not null)", [], function(err,rows,fields){
	  if (err){
	    reject(err);
	  }
	  else{
	    resolve();
	  }
	});
      });



      createComments = new Promise((resolve, reject) => {
	exports.query("create table Comments( periodid int not null, foreign key (periodid) references Periods(periodid), userid int not null, foreign key(userid) references Users(userid), comment varchar(255) not null, commentid int not null primary key auto_increment, timestamp datetime not null)", [], function(err,rows,fields){
	  if (err){
	    reject(err);
	  }
	  else{
	    resolve();
	  }
	});
      });

      Promise.all([createUsers, createClients, createPeriods, createComments]).then(function(){
	console.log("All Tables Created");
	done(false);
      },
	function(reason){
	  console.log("DBINIT ERROR");
	  return done(reason);
	});
    }
    else{
      console.log("All Tables Exist.");
      done(false);
    }
  });
};

