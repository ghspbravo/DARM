var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var engines = require('consolidate');

var indexRouter = require('./routes/index');
var searchRouter = require('./routes/search');
var listRouter = require('./routes/list');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('views', __dirname + '/public');
app.engine('html', engines.mustache);
app.set('view engine', 'html');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/list', listRouter);
app.use('/search', searchRouter);

module.exports = app;
