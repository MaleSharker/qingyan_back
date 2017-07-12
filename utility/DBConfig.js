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
        host:'192.168.1.109',
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

    //商品类别
    const Category = sequelize.import(global.apiPathPrefix + '/api/product/models/category');
    //商品规格
    const Specs = sequelize.import(global.apiPathPrefix + '/api/product/models/specs');
    //规格组
    const SpecsGroup = sequelize.import(global.apiPathPrefix + '/api/product/models/specsGroup');
    //规格选项
    const SpecsChoice = sequelize.import(global.apiPathPrefix + '/api/product/models/specsChoice');
    //规格关心
    const SpecsRelation = sequelize.import(global.apiPathPrefix + '/api/product/models/specsRelation');
    //SPU
    const SPU = sequelize.import(global.apiPathPrefix + '/api/product/models/spu');
    //SKU
    const SKU = sequelize.import(global.apiPathPrefix + '/api/product/models/sku');
    //商品属性
    const Attribute = sequelize.import(global.apiPathPrefix + '/api/product/models/attribute');
    //属性选项
    const AttriChoice = sequelize.import(global.apiPathPrefix + '/api/product/models/attriChoice');
    //属性关系
    const AttriRelation = sequelize.import(global.apiPathPrefix + '/api/product/models/attriRelation');


    // Brand.belongsTo(Tenant);
    Tenant.hasMany(Brand);
    Brand.hasMany(SPU);
    Category.hasMany(SPU);
    Category.hasMany(Specs);

    SpecsGroup.hasMany(Specs);
    Specs.hasMany(SpecsChoice);
    SpecsRelation.hasMany(SpecsChoice);

    SPU.hasMany(SKU);

    SKU.hasOne(AttriRelation);
    SKU.hasOne(SpecsRelation);

    Attribute.hasMany(AttriChoice);
    AttriRelation.hasMany(AttriChoice);


    Tenant.sync({force: true});
    Brand.sync({force: true});
    Category.sync({force: true});
    Specs.sync({force: true});
    SpecsGroup.sync({force: true});
    SpecsChoice.sync({force: true});
    SpecsRelation.sync({force: true});
    SPU.sync({force: true});
    SKU.sync({force: true});
    Attribute.sync({force: true});
    AttriChoice.sync({force: true});
    AttriRelation.sync({force: true});
};