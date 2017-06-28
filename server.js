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
// const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const chalk = require('chalk');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
// const MongoStore = require('connect-mongo')(session);
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
dotenv.load({ path: '.env.production' });


/**
 * routes
 */
global.apiPathPrefix = __dirname;
const productRoutes = require('./api/product/routes/productRoutes');
const userRoutes = require('./api/user/routes/userRoutes');

/**
 * API keys and Passport configuration
 */

const passportConfig = require('./config/passport');

/**
 * Create Express server
 */
const app = express();

/**
 * Connect to MongoDB
 */
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', (err) => {
    console.log(err);
    console.log('%s MongoDB connection error. Please make sure MongoDB is running.',chalk.red('✗'))
    progress.exit();
});

/**
 * Express configuration
 */
app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');
app.use(expressStatusMonitor());
app.use(compression());
app.use(sass({
    src: path.join(__dirname,'public'),
    dest:path.join(__dirname,'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
// app.use(session({
//     resave:true,
//     saveUninitialized: true,
//     secret: process.env.SESSION_SECRET,
//     store: new MongoStore({
//         url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
//         autoReconnect: true,
//         clear_interval: 3600
//     })
// }));
app.use(passport.initialize());
// app.use(passport.session());
// app.use((req, res, next) => {
//     if (req.path == '/api/upload') {
//         next();
//     }else {
//         lusca.csrf()(req, res, next);
//     }
// });
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
    res.locals.user = req.user;
    next();
});
// app.use((req, res, next) => {
//     //After successfun login, redirect back to the intended page
//     if (
//         !req.user &&
//             req.path !== '/login' &&
//             req.path !== '/signup' &&
//             !req.path.match(/^\/auth/) &&
//             !req.path.match(/\./)
//     ){
//         req.session.returnTo = req.path;
//     }else if (req.user && req.path == '/account'){
//         req.session.returnTo = req.path;
//     }
//     next();
// });
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

productRoutes(app);
userRoutes(app);

app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'),app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;










