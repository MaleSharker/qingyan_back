/**
 * Created by cc on 17/7/10.
 */
const chalk = require('chalk');
const Sequelize = require('sequelize');
const mongoose = require('mongoose');

var sequelize;

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
    sequelize = new Sequelize('qingyan_mysql','ccbai','bai117570',{
        host:'192.168.0.157',
        dialect:'mysql',

        pool:{
            max: 5,
            min: 0,
            idle: 10000
        },
        // logging: false  //关闭数据库语句输出
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


    Category.sync();
    Category.hasMany(SPU,{
        foreignKey: 'category_id',
        target: 'category_id'
    });

    Tenant.sync();
    Tenant.hasMany(Brand, {
        as: 'tenant',
        foreignKey: 'tenant_id',
        target: 'tenant_id'
    });

    Brand.sync();
    Brand.hasMany(SPU, {
        as:'brand',
        foreignKey:'brand_id',
        target:'brand_id'
    });

    SPU.sync();
    SPU.hasMany(SKU,{
        as: 'spu',
        foreignKey: 'spu_id',
        target: 'spu_id'
    });

    SKU.sync();
    /* - - - - - */
    SKU.hasOne(SpecsRelation, {
        foreignKey: 'sku_id',
        target: 'sku_id'
    });

    SpecsGroup.sync();
    SpecsGroup.hasMany(Specs,{
        as:'specsgroup',
        foreignKey: 'group_id',
        target: 'group_id'
    });

    Category.hasMany(Specs,{
        foreignKey: 'category_id',
        target: 'category_id'
    });

    Specs.sync();
    Specs.hasMany(SpecsChoice, {
        as: 'specs',
        foreignKey: 'specs_id',
        target: 'specs_id'
    });

    SpecsChoice.sync();
    SpecsChoice.hasOne(SpecsRelation,{
        foreignKey: 'specs_choice_id',
        target: 'choice_id'
    });

    SpecsRelation.sync();
    /* - - - - - - */


    Attribute.sync();
    AttriChoice.hasMany(Attribute, {
        as:'attrichoice',
        foreignKey:'attrichoice_id',
        target: 'choice_id'
    });
    AttriChoice.sync();

    AttriRelation.hasOne(AttriChoice, {
        as: 'attriRelation',
        foreignKey: 'attri_relation_id',
        target: 'attri_relation_id'
    });
    AttriRelation.hasOne(SKU, {
        foreignKey: 'sku_id',
        target: 'sku_id'
    });

    AttriRelation.sync();

    // SKU.drop();
    // SPU.drop();
    // Brand.drop();
    // Tenant.drop();
    // Category.drop();
    // Specs.drop();
    // SpecsChoice.drop();
    // SpecsGroup.drop();
    // SpecsRelation.drop();
    // Attribute.drop();
    // AttriChoice.drop();
    // AttriRelation.drop();

};


/**
 * 商铺模型
 * @returns {Model}
 * @constructor
 */
exports.Tenant = () => {
    return sequelize.import(global.apiPathPrefix + '/api/tenants/models/tenant');
};

/**
 * 品牌
 * @returns {Model}
 * @constructor
 */
exports.Brand = () => {
    return sequelize.import(global.apiPathPrefix + '/api/tenants/models/brand');
};

/**
 * 分类
 * @returns {Model}
 * @constructor
 */
exports.Category = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/category');
};

/**
 * 规格
 * @returns {Model}
 * @constructor
 */
exports.Specs = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/specs');
};

/**
 * 规格组
 * @returns {Model}
 * @constructor
 */
exports.SpecsGroup = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/specsGroup');
};

/**
 * 规格选项
 * @returns {Model}
 * @constructor
 */
exports.SpecsChoice = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/specsChoice');
};

/**
 * 规格关系
 * @returns {Model}
 * @constructor
 */
exports.SpecsRelation = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/specsRelation');
};

/**
 * Standard Production Unit
 * @returns {Model}
 * @constructor
 */
exports.SPU = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/spu');
};

/**
 * Stock Keeping Unit
 * @returns {Model}
 * @constructor
 */
exports.SKU = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/sku');
};

/**
 * 属性
 * @returns {Model}
 * @constructor
 */
exports.Attribute = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/attribute');
};

/**
 * 属性选项
 * @returns {Model}
 * @constructor
 */
exports.AttriChoice = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/attriChoice');
};

/**
 * 属性关系
 * @returns {Model}
 * @constructor
 */
exports.AttriRelation = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/attriRelation');
};
