var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var testAPIRouter = require('./routes/test');
var monthOfYearQueryAPIRouter = require('./routes/queries/month_of_year');
var transportationQueryAPIRouter = require('./routes/queries/transportation');
var criminalQueryAPIRouter = require('./routes/queries/criminal');
var propertyTypesQueryAPIRouter = require('./routes/queries/property_types');
var resdevQueryAPIRouter = require('./routes/queries/res_dev');
var numOfTuplesQueryAPIRouter = require('./routes/queries/num_of_tuples');

var app = express();

// TODO: Most likely do not need the views or view engine for the backend.
//       Also, because we are using React. 
//
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/test', testAPIRouter);
app.use('/queries/monthofyear', monthOfYearQueryAPIRouter);
app.use('/queries/transportation', transportationQueryAPIRouter);
app.use('/queries/criminal', criminalQueryAPIRouter);
app.use('/queries/propertytypes', propertyTypesQueryAPIRouter);
app.use('/queries/resdev', resdevQueryAPIRouter);
app.use('/queries/numoftuples', numOfTuplesQueryAPIRouter);

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
