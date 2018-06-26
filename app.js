var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clientsRouter = require('./routes/clients');
var timesheetRouter = require('./routes/timesheet');
var commentsRouter = require('./routes/comments');
var flash = require('express-flash');

var db = require('./db');

db.connect(db.MODE_TEST, async function(err){
  if(!err){
    connection = db.get();
    await db.initdb(connection, function(err){
      if(err){
	console.log(err);
      }
      else{
	console.log("success");
      }
      connection.end();
    });
  }
  else{
    connection.end();
    res.send("Error Connecting to Database");
  }
});


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'vertis test',
  resave: true,
  saveUninitialized: false
}));


app.use(function(req, res, next){
  res.locals.session = req.session;
  next();
});
app.use(flash());

app.use('/flash', function(req,res){
  req.flash('success',"Flash Message.");
  res.redirect('/');
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/clients', clientsRouter);
app.use('/timesheet', timesheetRouter);
app.use('/comments', commentsRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
