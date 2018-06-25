var mysql = require('mysql');
var async = require('async');

var PRODUCTION_DB = 'vertis_production_db';
var TEST_DB = 'vertis2';

exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production'

var state = {
  pool: null,
  mode: null,
}

exports.connect = function(mode, done){
  state.pool = mysql.createPool(process.env.CLEARDB_DATABASE_URL || {
  host: 'localhost',
  user: 'web',
  password: 'verTis~23',
  database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB,
});
  state.mode = mode;
  done();
}
exports.get = function(){
  return state.pool;
}

exports.fixtures = function(data) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  var names = Object.keys(data.tables)
  async.each(names, function(name, cb) {
    async.each(data.tables[name], function(row, cb) {
      var keys = Object.keys(row)
	, values = keys.map(function(key) { return "'" + row[key] + "'" })

      pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', cb)
    }, cb)
  }, done)
}



exports.create = function(mode,table, data, done){
  exports.connect(mode, function(){

    var pool = state.pool;
    if (!pool) {
      return done(new Error('Missing database connection.'));
    }

    pool.query('INSERT INTO '+table+' SET ?', data, function(err, rows, fields) {
      if (!err) {
	console.log("Success");
      } else {
	console.log(err);
      }
      done(err,rows);
    });

  });
};

exports.drop = function(tables, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  async.each(tables, function(name, cb) {
    pool.query('DELETE * FROM ' + name, cb);
  }, done);
}


exports.initdb = function(cb){
  exports.connect(exports.MODE_TEST,function(){
    pool = exports.get();

    pool.query("SELECT 1 FROM Comments, Users, Clients, Periods LIMIT 1", function(err,rows,fields){
      if(err){


	queries = [
	  "CREATE TABLE Users(userid int not null primary key auto_increment, email varchar(100) not null, firstname varchar(100) not null, address varchar(255), password varchar(255) not null)",
	  "CREATE TABLE Clients(clientid int not null primary key auto_increment, name varchar(100) not null, firstname varchar(100) not null, lastname varchar(100) not null, position varchar(255) not null)",
	  "CREATE TABLE Periods(userid int not null, foreign key (userid) references Users(userid), clientid int not null, foreign key (clientid) references Clients(clientid), periodid int not null primary key auto_increment, title varchar(255) not null, start datetime not null, end datetime not null)",
	  "create table Comments( periodid int not null, foreign key (periodid) references Periods(periodid), userid int not null, foreign key(userid) references Users(userid), comment varchar(255) not null, commentid int not null primary key auto_increment)",
	];

	async.each(queries, async function(q, cb){
	  await pool.query(q, async function(err,rows,fields){
	    await rows;
	    if (err){
	      console.log(err);
	    }
	  });
	}, cb);


	/*
	createUsers = new Promise((resolve, reject) => {
	  pool.query("CREATE TABLE Users(userid int not null primary key auto_increment, email varchar(100) not null, firstname varchar(100) not null, address varchar(255), password varchar(255) not null)", function(err,rows,fields){
	    if (err){
	      reject(err);
	    }
	    else{
	      resolve();
	    }
	  });
	});


	createClients = new Promise((resolve, reject) => {
	  pool.query("CREATE TABLE Clients(clientid int not null primary key auto_increment, name varchar(100) not null, firstname varchar(100) not null, lastname varchar(100) not null, position varchar(255) not null)", function(err,rows,fields){
	    if (err){
	      reject(err);
	    }
	    else{
	      resolve();
	    }
	  });
	});


	createPeriods = new Promise((resolve, reject) => {
	  pool.query("CREATE TABLE Periods(userid int not null, foreign key (userid) references Users(userid), clientid int not null, foreign key (clientid) references Clients(clientid), periodid int not null primary key auto_increment, title varchar(255) not null, start datetime not null, end datetime not null)", function(err,rows,fields){
	    if (err){
	      reject(err);
	    }
	    else{
	      resolve();
	    }
	  });
	});



	createComments = new Promise((resolve, reject) => {
	  pool.query("create table Comments( periodid int not null, foreign key (periodid) references Periods(periodid), userid int not null, foreign key(userid) references Users(userid), comment varchar(255) not null, commentid int not null primary key auto_increment)", function(err,rows,fields){
	    if (err){
	      reject(err);
	    }
	    else{
	      resolve();
	    }
	  });
	});
	

	Promise.all([createUsers, createClients, createPeriods, createComments]).then(function(){
	  cb();
	},
	function(reason){
	  console.log(reason);
	});

	*/
      }
    });
  });
};
  
