var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var http = require('http');
var mysql = require('mysql');
var session = require('express-session');
var port = 5000;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

const db = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'gitbook',
  database: 'Gitbook'
});

// connect to database
db.connect((err) => {
  if (err) {
      throw err;
  }
  console.log('Connected to database');
});
global.db = db;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 'eeeeee',
  resave: true,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

app.use(express.json());

module.exports = app;



app.listen(process.env.PORT || port, function() {
  console.log('Example app listening on port '+port+'!');
});
