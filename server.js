// var express = require('express');
// var app = new express();
// var port = process.env.PORT || 3000,
// 	mongoose = require('mongoose'),
// 	Task = require('./api/models/todoListModel'),
// 	bodyParser = require('body-parser');
//
// mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/Tododb');
//
// app.use(bodyParser.urlencoded({ extended:true }));
// app.use(bodyParser.json());
//
// var routes = require('./api/routes/todoListRoutes');
// routes(app);
//
// app.use(function(req,res){
// 	res.status(404).send({url:req.originalUrl + ' not found'});
// });
//
// app.listen(port);
//
// console.log('todo list RESTful API server started on: ' + port);

/**
 * Module dependecnies
 */

const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads')});

/**
 * load environment variables
 */
dotenv.load({ path: '.env.example' });
