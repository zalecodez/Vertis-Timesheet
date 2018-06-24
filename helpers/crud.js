var db = require('../db');

exports.create = function(table, data){
  db.connect(db.MODE_TEST, function(err){
    if (err) {
      console.log(err);
      res.status(500).json(appData);
    } else {
      connection = db.get();
      connection.query('INSERT INTO '+table+' SET ?', data, function(err, rows, fields) {
	if (!err) {
	  console.log
	} else {
	  console.log(err)
	  appData["data"] = "Error Occured!";
	  res.status(400).json(appData);
	}
      });
    }
  });
};
