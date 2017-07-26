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
        host:process.env.MySQL_URL,
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
    //商品详情图
    const SPUImages = sequelize.import(global.apiPathPrefix + '/api/product/models/spuImages');
    //SKU
    const SKU = sequelize.import(global.apiPathPrefix + '/api/product/models/sku');
    //商品属性
    const Attribute = sequelize.import(global.apiPathPrefix + '/api/product/models/attribute');
    //属性选项
    const AttriChoice = sequelize.import(global.apiPathPrefix + '/api/product/models/attriChoice');
    //属性关系
    const AttriRelation = sequelize.import(global.apiPathPrefix + '/api/product/models/attriRelation');

    //* * * * * */
    //优惠券
    const Coupons = sequelize.import(global.apiPathPrefix + '/api/order/model/coupons');
    //物流详情
    const LogisticItems = sequelize.import(global.apiPathPrefix + '/api/order/model/logisticItems');
    //货运信息
    const OrderDelivery = sequelize.import(global.apiPathPrefix + '/api/order/model/orderDelivery');
    //订单
    const Order = sequelize.import(global.apiPathPrefix + '/api/order/model/orderModel');
    //订单商品表
    const OrderSKUs = sequelize.import(global.apiPathPrefix + '/api/order/model/orderSKU');
    //支付方式
    const Payment = sequelize.import(global.apiPathPrefix + '/api/order/model/paymentMethod');

    //* * * * - user - * * * * * */
    //地址列表
    const Address = sequelize.import(global.apiPathPrefix + '/api/user/models/Address');
    //购物车列表
    const ShoppingCart = sequelize.import(global.apiPathPrefix + '/api/user/models/ShoppingCart');


    Category.sync();
    Category.hasMany(SPU,{
        as: 'SPUs',
        foreignKey: 'category_id',
        target: 'category_id'
    });

    Tenant.sync();
    Tenant.hasMany(Brand, {
        as: 'Brands',
        foreignKey: 'tenant_id',
        target: 'tenant_id'
    });

    Brand.sync();
    Brand.hasMany(SPU, {
        as:'SPUs',
        foreignKey:'brand_id',
        target:'brand_id'
    });

    SPU.sync();
    SPU.hasMany(SKU,{
        as: 'SKUs',
        foreignKey: 'spu_id',
        target: 'spu_id'
    });
    SKU.sync();

    SPU.hasMany(SPUImages,{
        as:'Images',
        foreignKey: 'spu_id',
        target: 'spu_id'
    });

    SPUImages.sync();

    /* - - - - - */
    SKU.hasOne(SpecsRelation, {
        foreignKey: 'sku_id',
        target: 'sku_id'
    });

    SpecsGroup.sync();
    SpecsGroup.hasMany(Specs,{
        as:'Specses',
        foreignKey: 'group_id',
        target: 'group_id'
    });

    Category.hasMany(Specs,{
        foreignKey: 'category_id',
        target: 'category_id'
    });

    Specs.sync();
    Specs.hasMany(SpecsChoice, {
        as: 'SpecsChoices',
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

    Tenant.hasMany(Attribute,{
        as: 'Attributes',
        foreignKey: 'tenant_id',
        target: 'tenant_id'
    });

    Attribute.sync();

    Attribute.hasMany(AttriChoice,{
        as:'AttriChoice',
        foreignKey:'attribute_id',
        target:'attri_id'
    });
    AttriChoice.sync();

    AttriChoice.hasMany(AttriRelation, {
        as: 'AttriRelations',
        foreignKey: 'choice_id',
        target: 'choice_id'
    });
    SKU.hasMany(AttriRelation, {
        as: 'AttriRelations',
        foreignKey: 'sku_id',
        target: 'sku_id'
    });
    Attribute.hasMany(AttriRelation, {
        as: 'AttriRelation',
        foreignKey: 'attri_id',
        target: 'attri_id'
    });

    AttriRelation.sync();

    /* * * * * * * * */
    Order.sync();

    Order.hasMany(OrderSKUs,{
        as:'Items',
        foreignKey:'order_id',
        target:'order_id'
    });
    OrderSKUs.sync();

    Order.hasOne(OrderDelivery,{
        as:'delivery',
        foreignKey:'order_id',
        target:'order_id'
    });
    OrderDelivery.sync();

    OrderDelivery.hasMany(LogisticItems,{
        as:'items',
        foreignKey:'deliver_id',
        target:'deliver_id'
    });
    OrderDelivery.sync();

    Order.hasOne(Payment, {
        as: 'Payment',
        foreignKey: 'order_id',
        target:'order_id'
    });
    Payment.sync();

    Coupons.sync();

    /* * * * * - USER - * * * * */
    Address.sync();

    ShoppingCart.sync();

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
    // Coupons.drop();
    // LogisticItems.drop();
    // OrderDelivery.drop();
    // Order.drop();
    // OrderSKUs.drop();
    // Payment.drop();
    // Address.drop();
    // ShoppingCart.drop();

};

/**
 * 获取 Sequelize 实例
 * @returns {*}
 */
exports.getSequelize = () => {
    return sequelize;
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
 * 商品详情图列表
 * @returns {Model}
 * @constructor
 */
exports.SPUImages = () => {
    return sequelize.import(global.apiPathPrefix + '/api/product/models/spuImages');
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

/**
 * 优惠券
 * @returns {Model}
 * @constructor
 */
exports.Coupons = () => {
    return sequelize.import(global.apiPathPrefix + '/api/order/model/coupons')
};

/**
 * 物流消息条目
 * @returns {Model}
 * @constructor
 */
exports.LogisticItem = () => {
    return sequelize.import(global.apiPathPrefix + '/api/order/model/logisticItems')
};

/**
 * 物流详情
 * @returns {Model}
 * @constructor
 */
exports.OrderDelivery = () => {
    return sequelize.import(global.apiPathPrefix + '/api/order/model/orderDelivery')
};

/**
 * 订单详情
 * @returns {Model}
 * @constructor
 */
exports.OrderModel = () => {
    return sequelize.import(global.apiPathPrefix + '/api/order/model/orderModel')
};

/**
 * 订单商品列表
 * @returns {Model}
 * @constructor
 */
exports.OrderSKUs = () => {
    return sequelize.import(global.apiPathPrefix + '/api/order/model/orderSKU')
};

/**
 * 支付列表
 * @returns {Model}
 * @constructor
 */
exports.Payment = () => {
    return sequelize.import(global.apiPathPrefix + '/api/order/model/paymentMethod')
};

/**
 * 地址详情列表
 * @returns {Model}
 * @constructor
 */
exports.Address = () => {
    return sequelize.import(global.apiPathPrefix + '/api/user/models/Address')
};

/**
 * 购物车列表
 * @returns {Model}
 * @constructor
 */
exports.ShoppingCart = () => {
    return sequelize.import(global.apiPathPrefix + '/api/user/models/ShoppingCart')
};

