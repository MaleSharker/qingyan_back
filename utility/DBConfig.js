/**
 * Created by cc on 17/7/10.
 */
const chalk = require('chalk');
const Sequelize = require('sequelize');
const mongoose = require('mongoose');


exports.configMongoose = () => {
    mongoose.Promise = global.Promise;
    mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
    mongoose.connection.on('error', (err) => {
        console.log(err);
        console.log('%s MongoDB connection error. Please make sure MongoDB is running.',chalk.red('✗'));
        progress.exit();
    });
};


exports.configMysql = () => {
    /**
     * Connect to mysql
     */
    const sequelize = new Sequelize('qingyan_mysql','ccbai','bai117570',{
        host:'127.0.0.1',
        dialect:'mysql',

        pool:{
            max: 5,
            min: 0,
            idle: 10000
        }
    });

    sequelize
        .authenticate()
        .then( () => {
            console.log('%s Connection has been established successfully.', chalk.green('v'));
        })
        .catch((error) => {
            console.log(error);
            console.log('%s MySQL connection error. Please make sure MySQL server is running.',chalk.red('✗'));
            process.exit();
        });


    /**
     * tenant schemas
     */
    const Tenant = sequelize.import(global.apiPathPrefix + '/api/tenants/models/tenant');
    const Brand = sequelize.import(global.apiPathPrefix + '/api/tenants/models/brand');


    Brand.belongsTo(Tenant);
    Tenant.hasMany(Brand);


    Tenant.sync({force:true});
    Brand.sync({force: true});
};