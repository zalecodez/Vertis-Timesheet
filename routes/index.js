var express = require('express');
var router = express.Router();

var sess;
/* GET home page. */
router.get('/', function(req, res, next) {
  sess = req.session;
  
  if (sess.email){
    if (sess.admin){
      res.render('admin',{
	firstname: sess.firstname,
	lastname: sess.lastname,
	email: sess.email,
	address: sess.address
      });
    }
    else{
      res.redirect('/timesheet');
    }
  }else{
    res.render('login');
    //res.render('index', { title: 'Express' });
  }
});

module.exports = router;
