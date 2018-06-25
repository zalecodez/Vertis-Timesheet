var mysql = require('mysql');
var async = require('async');

var PRODUCTION_DB = 'vertis_production_db';
var TEST_DB = 'vertis';

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

/*
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'web',
  password: 'verTis~23',
  database: 'vertis',
});

connection.connect(function(err){
  if (err) throw err;
  console.log("You are now connected...");
});
*/

exports.drop = function(tables, done) {
  var pool = state.pool
  if (!pool) return done(new Error('Missing database connection.'))

  async.each(tables, function(name, cb) {
    pool.query('DELETE * FROM ' + name, cb);
  }, done);
}
