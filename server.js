/**
 * Module dependecnies
 */

const express = require('express');
const compression = require('compression');
// const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
// const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const chalk = require('chalk');
const passport = require('passport');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const expressValidator = require('express-validator');
const expressStatusMonitor = require('express-status-monitor');
const sass = require('node-sass-middleware');
const multer = require('multer');
const DBConfig = require('./utility/DBConfig');
const upload = multer({ dest: path.join(__dirname, 'uploads')});


/**
 * load environment variables
 */
dotenv.load({ path: '.env.production' });


/**
 * API keys and Passport configuration
 */
const passportConfig = require('./config/passport');

/**
 * Create Express server
 */
const app = express();

/**
 * Connect to MySQL and Config Schema
 */
DBConfig.configMysql();

/**
 * Connect to MongoDB
 */
DBConfig.configMongoose();


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
app.use(expressValidator({
    customValidators:{
        gte:(param,num) => {
            return param >= num;
        },
    }
}));
app.use(fileUpload());
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
app.use(express.static(path.join(__dirname, 'uploads'), { maxAge: 31557600000 }));

//浏览器跨域cors
var corsConfig = {
    'origin': '*',
    'methods': 'GET,POST,DELETE',
    'preflightContinue': false,
    'optionsSuccessStatus': 204,
};
app.use(cors(corsConfig));

//路径匹配
/**
 * routes
 */
global.apiPathPrefix = __dirname;
const productRoutes = require('./api/product/routes/productRoutes');
const userRoutes = require('./api/user/routes/userRoutes');
const tenantRoutes = require('./api/tenants/routes/tenantRoutes');
const attriRoutes = require('./api/product/routes/attributeRoutes');

const addressRoutes = require('./api/user/routes/addressRoutes');
const shopCartRoutes = require('./api/user/routes/shopCartRoutes');
const userCouponRoutes = require('./api/user/routes/couponRoutes');

//Order
const orderRoutes = require('./api/order/route/orderRoutes');

productRoutes(app);
userRoutes(app);
tenantRoutes(app);
attriRoutes(app);

addressRoutes(app);
shopCartRoutes(app);
userCouponRoutes(app);

orderRoutes(app);

app.use((req, res) => {
    if (!res.finished){
        res.status(404).send({url:req.originalUrl + ' not found'});
    }
});

app.use(errorHandler());

/**
 * Start Express server.
 */
app.listen(app.get('port'), () => {
    console.log('%s App is running at http://localhost:%d in %s mode', chalk.green('✓'),app.get('port'), app.get('env'));
    console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
