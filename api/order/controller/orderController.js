/**
 * Created by cc on 17/7/25.
 */


const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const SwallowConst = require(global.apiPathPrefix + '/utility/SwallowConst');
const Bluebird = require('bluebird');

const sequelize = DBConfig.getSequelize();
const Coupons = DBConfig.Coupons();
const OrderDelivery = DBConfig.OrderDelivery();
const OrderModel = DBConfig.OrderModel();
const TenantOrder = DBConfig.TenantOrder();
const OrderSKUs = DBConfig.OrderSKUs();
const Payment = DBConfig.Payment();
const SKUs = DBConfig.SKU();
const AttriRelation = DBConfig.AttriRelation();
const AttriChoice = DBConfig.AttriChoice();
const Attributes = DBConfig.Attribute();

const OrderStatus = SwallowConst.OrderStatus;

/**
 * 创建订单
 * @param req
 * @param res
 * @param next
 */
// 开始 --> 检查所提交商品从属关系及商品状态 --> 创建用户订单 --> 创建店铺订单 --> 创建订单商品列表 --> 结束
exports.postCreateOrder = (req, res, next) => {

    req.assert('actionType','check parameter actionType').isInt().isIn([1,2]);  //1 : 直接购买, 2 : 购物车结算
    req.assert('skuList','check parameter skus').notEmpty();  //[{tenantID:"",skuID:1, count: 1}]
    var skusParameter = JSON.parse(req.body.skuList);
    let error = req.validationErrors();
    if (error || skusParameter.length > 0){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameter validate error'})
    }

    var tra = sequelize.transaction();

    var skuIDs = []; //防重
    var tenantIDs = [];//商家ID
    var totalPrice = 0.0;
    SwallowUtil
        .validateUser(req.headers.key, req.headers.token)
        .then(() => {

            return new Bluebird((resolve,reject) => {
                skusParameter.map((sku) => {
                    if (!SwallowUtil.validateContains(skuIDs, sku.skuID)){
                        skuIDs.push(sku.skuID);
                    }
                    if (!SwallowUtil.validateContains(tenantIDs, sku.tenantID)){
                        tenantIDs.push(sku.tenantID);
                    }
                });
                if (skuIDs.length !== skusParameter.length){
                    reject({error: '含有重复商品,请删除重复商品后重新提交'});
                }else{
                    resolve();
                }
            });

        })
        .then(() => {
            return SKUs
                .findAll({
                    where:{
                        sku_id:{
                            $in: skuIDs
                        }
                    },
                    include:[
                        {
                            model: AttriRelation,
                            as: 'AttriRelations'
                        }
                    ],
                })
        })
        .then((skus) => {
            return new Bluebird((resolve,reject) => {
                var choiceIDs = []; //属性值ID 列表
                skus.map((sku) => {
                    let skuJson = sku.toJSON();
                    skusParameter.map((para) => {
                        if (para.skuID == skuJson.sku_id){
                            if (para.count > skuJson.stock && skuJson.on_sale){
                                reject({error:'库存不足',sku:skuJson})
                            }else{
                                para.sku = skuJson
                            }
                        }
                    });
                    let choices = skuJson.AttriRelations;
                    choices.map((choice) => {
                        if (!SwallowUtil.validateContains(choiceIDs,choice.choice_id)){
                            choiceIDs.push(choice.choice_id);
                        }
                    });
                });
                resolve(choiceIDs);
            });
        })
        .then((choiceIDs) => {
            return AttriChoice
                .findAll({
                    where:{
                        choice_id:{
                            $in: choiceIDs
                        }
                    }
                })
        })
        .then((choicePromises) => {
            return new Bluebird((resolve, reject) => {
                var attriChoices = [];
                choicePromises.map((choice) => {
                    attriChoices.push(choice.toJSON())
                });

                skusParameter.map((sku) => {
                    let skuChoices = sku.sku.AttriRelations;
                    let intersections = SwallowUtil.arrayIntersection(attriChoices,'choice_id',skuChoices,'choice_id');
                    if (intersections.length <= 0){
                        reject({error:'some attrichoice can not be find'});
                    }
                    var attributeName = "";
                    intersections.map((value) => {
                        attributeName += value.value + ' ';
                    });
                    sku.attributeDesc = attributeName;
                });
                resolve();
            });
            /* - - - - 参数检查完毕 - - - -*/
        })
        .then(() => {
            /* - - - - 创建用户订单 - - - - */
            var totalAmount = 0.0;
            skusParameter.map((paras) => {
                let price = paras.sku.price;
                totalAmount += price;
            });
            return OrderModel
                .create({
                    customer_id: req.headers.key,
                    total_amount: 0,
                    order_status_code: SwallowConst.OrderStatusKeyValue.pending,
                    order_type: req.body.actionType
                },{
                    transaction:tra
                })
        })
        .then((userOrder) => {
            /* - - - - 创建商家订单 - - - - */
            //[{tenantID:"",skuID:1, count: 1, sku:{ },attributeDesc:'',}]
            var list =[];
            skusParameter.map((parameter) => {
                var obj = {};
                obj
            });
            return TenantOrder
                .bulkCreate({

                },{
                    transaction: tra,
                });
        })
        .then((order) => {
            var items = [];
            skusList.map((sku) => {
                let item = {};
                item.sku_id = sku.sku_id;
                item.sku_name = sku.name;
                item.sku_attribute = sku.attributeDesc;
                item.sku_price = sku.price;
                item.count = sku.count;
                item.sku_image = '';
                item.order_id = order.get('order_id');
                items.push(item);
                totalPrice += (sku.count).toFixed(2) * sku.price;
            });
            return OrderSKUs
                .bulkCreate(
                    items
                    ,{
                        transaction:tra
                    })
        })
        .then((skuItems) => {
            tra.commit();
            res.json({status:ErrorTypes.Success, result:{items:skuItems,totalPrice}, msg:'success'})
        })
        .catch((error) => {
            tra.rollback();
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })


};


/**
 * 修改订单中商品数量
 * @param req
 * @param res
 * @param next
 */
exports.postUpdateOrderCount = (req, res, next) => {

    req.assert('orderID','check parameter orderID').isInt();
    req.assert('skuID','check parameter skuID').isInt();
    req.assert('count','check parameter count').isInt();
    let error = req.validationErrors();
    if (error || req.body.count <= 0){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:''})
    }

    SwallowUtil
        .validateUser(req.headers.key, req.headers.token)
        .then((user) => {
            return OrderModel
                .findOne({
                    where:{
                        customer_id: user.userID,
                        order_id: req.body.orderID
                    },
                    include:[
                        {
                            model:OrderSKUs,
                            as: 'Items'
                        }
                    ]
                })
        })
        .then((orderModel) => {
            let order = orderModel.toJSON();
            return new Bluebird((resolve,reject) => {
                order.Items.map((item) => {
                    if (item.sku_id == req.body.skuID){
                        resolve()
                    }
                });
                reject({error: '商品未包含在该订单内'})
            });
        })
        .then(() => {
            return OrderSKUs
                .update({
                    count:req.body.count
                },{
                    where:{
                        order_id: req.body.orderID,
                        sku_id: req.body.skuID
                    },
                    fields:['count']
                })
        })
        .then((orderSKU) => {
            return OrderSKUs
                .findAll({
                    where:{
                        order_id: req.body.orderID
                    }
                })
        })
        .then((items) => {
            var totalPrice = 0.00;
            items.map((item) => {
                let count = item.get('count');
                let price = item.get('sku_price');
                totalPrice += count * price;
            });
            res.json({status:ErrorTypes.Success, result:{price:totalPrice.toFixed(2)}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};


/**
 * 管理员 - 修改订单商品价格
 * @param req
 * @param res
 * @param next
 */
exports.postUpdateOrderPrice = (req,res,next) => {

    req.assert('tenantID', 'check parameter tenantID').isInt();
    req.assert('customerID','check parameter customerID').isInt();
    req.assert('orderID','check parameter orderID').isInt();
    req.assert('skuID','check parameter skuID').isInt();
    req.assert('price','check parameter price').isDecimal();
    let error = req.validationErrors();
    if (error || req.body.price <= 0){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.key, req.headers.token, req.body.tenantID)
        .then((tenant) => {
            return OrderModel
                .findOne({
                    where:{
                        customer_id: req.body.customerID,
                        order_id: req.body.orderID
                    },
                    include:[
                        {
                            model:OrderSKUs,
                            as: 'Items'
                        }
                    ]
                })
        })
        .then((orderModel) => {
            let order = orderModel.toJSON();
            return new Bluebird((resolve,reject) => {
                order.Items.map((item) => {
                    if (item.sku_id == req.body.skuID){
                        resolve()
                    }
                });
                reject({error: '商品未包含在该订单内'})
            });
        })
        .then(() => {
            return OrderSKUs
                .update({
                    sku_price:req.body.price
                },{
                    where:{
                        order_id: req.body.orderID,
                        sku_id: req.body.skuID
                    },
                    fields:['sku_price']
                })
        })
        .then((sku) => {
            res.json({status:ErrorTypes.Success, result:{succcess:sku}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })
};


/**
 * 商铺查看订单列表
 * @param req
 * @param res
 * @param next
 */
exports.postTenantFindOrderList = (req,res,next) => {

    req.assert('tenantID','check parameter tenantID').isInt();
    req.assert('page','check parameter page').isInt().gte(0);
    req.assert('itemsPerPage','check parameter itemsPerPage').isInt().gte(10);
    req.assert('orderType','check parameter orderType').isString().isIn(OrderStatus);
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.key,req.headers.token,req.body.tenantID)
        .then((tenant) => {
            return OrderModel
                .findAndCount({
                    where:{

                    }
                })
        })


};

/**
 * 用户查看订单列表
 * @param req
 * @param res
 * @param next
 */
exports.postUserFindOrderList = (req,res,next) => {

};


