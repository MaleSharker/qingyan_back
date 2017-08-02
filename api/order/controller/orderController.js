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
const SettleStatus = SwallowConst.SettledStatus;

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
    var userOrderPro;
    var tenantOrderPros;
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
                totalAmount += price * paras.count;
            });
            return OrderModel
                .create({
                    customer_id: req.headers.key,
                    total_amount: totalAmount,
                    order_status_code: SwallowConst.OrderStatusKeyValue.pending,
                    order_type: req.body.actionType
                },{
                    transaction:tra
                })
        })
        .then((userOrder) => {
            /* - - - - 创建商家订单 - - - - */
            //[{tenantID:"",skuID:1, count: 1, sku:{ },attributeDesc:'',}]
            userOrderPro = userOrder;
            var list =[];
            tenantIDs.map((tenantID) => {
                skusParameter.map((parameter) => {
                    if (tenantID == parameter.tenantID){
                        var obj = {};
                        obj.user_order_id = userOrder.get('order_id');
                        obj.customer_id = req.headers.key;
                        obj.tenant_id = parameter.tenantID;
                        list.push(obj)
                    }
                });
            });
            return TenantOrder
                .bulkCreate({
                    list
                },{
                    transaction: tra,
                });
        })
        .then((tenantOrders) => {
            /* - - - - 创建订单商品列表 - - - - */
            tenantOrderPros = tenantOrders;
            var orderItems = [];
            var logisticAmount = 0.0;
            skusParameter.map((parameter) => {
                let item = {};
                item.user_order_id = userOrderPro.get('order_id');
                item.sku_id = parameter.sku.sku_id;
                item.sku_name = parameter.sku.name;
                item.sku_attribute = parameter.attributeDesc;
                item.sku_price = parameter.sku.price;
                item.count = parameter.count;
                tenantOrders.map((tenantOrder) => {
                    if (tenantOrder.get('tenant_id') == parameter.tenantID){
                        item.tenant_order_id = tenantOrder.get('tenant_order_id')
                    }
                });
                orderItems.push(item);
                totalPrice += item.sku_price * item.count;
            });
            logisticAmount = 0.0;
            tenantOrders.map((tenantOrder) => {
                logisticAmount += tenantOrder.get('logistics_amount');
            });
            totalPrice += logisticAmount;
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
    req.assert('tenantOrderID','check parameter tenantOrderID').isInt();
    req.assert('skuID','check parameter skuID').isInt();
    req.assert('count','check parameter count').isInt();
    let error = req.validationErrors();
    if (error || req.body.count <= 0){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:''})
    }

    var logisticAmount = 0.0; //订单总费用
    SwallowUtil
        .validateUser(req.headers.key, req.headers.token)
        .then((user) => {
            return OrderSKUs
                .update({
                    count:req.body.count
                },{
                    where:{
                        user_order_id: req.body.orderID,
                        tenant_order_id: req.body.tenantOrderID,
                        sku_id: req.body.skuID
                    },
                    fields:['count']
                })
        })
        .then(() => {
            return TenantOrder
                .findAll({
                    where:{
                        user_order_id: req.body.orderID,
                    }
                })
        })
        .then((tenantOrders) => {
            logisticAmount = 0.0;
            tenantOrders.map((order) => {
                logisticAmount += order.get('logistics_amount');
            });
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
            res.json({status:ErrorTypes.Success, result:{totalPrice:totalPrice.toFixed(2)}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};


/**
 * 管理员 - 修改订单商品单价
 * @param req
 * @param res
 * @param next
 */
exports.postTenantUpdateOrderPrice = (req,res,next) => {

    req.assert('tenantID', 'check parameter tenantID').isInt();
    req.assert('orderID','check parameter orderID').isInt();
    req.assert('tenantOrderID', 'check parameter tenantOrderID').isInt();
    req.assert('skuID','check parameter skuID').isInt();
    req.assert('price','check parameter price').isDecimal();
    let error = req.validationErrors();
    if (error || req.body.price <= 0){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.key, req.headers.token, req.body.tenantID)
        .then(() => {
            return OrderSKUs
                .update({
                    sku_price:req.body.price
                },{
                    where:{
                        tenant_order_id: req.body.tenantOrderID,
                        user_order_id: req.body.orderID,
                        sku_id: req.body.skuID,
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
 * 管理员 - 修改订单物流费用
 * @param req
 * @param res
 * @param next
 */
exports.postTenantUpdateOrderLogistic = (req,res,next) => {

    req.assert('tenantID','check parameter tenantID').isInt();
    req.assert('tenantOrderID', 'check parameter tenantOrderID').isInt();
    req.assert('logisticPrice','check parameter logisticPrice').isInt();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'Parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.key,req.headers.token,req.body.tenantID)
        .then((tenant) => {
            return TenantOrder
                .update({
                    logistics_amount: req.body.logisticPrice
                },{
                    fields:['logistics_amount'],
                    where:{
                        tenant_order_id: req.body.tenantOrderID,
                        tenant_id: tenant.get('tenant_id')
                    }
                })
        })
        .then((updated) => {
            res.json({status:ErrorTypes.Success, result:{updated}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                return res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
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
    req.assert('settleStatus','check parameter settleStatus').isString().isIn(SettleStatus);
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'error'})
    }
    SwallowUtil
        .validateTenantOperator(req.headers.key,req.headers.token,req.body.tenantID)
        .then((tenant) => {
            return TenantOrder
                .findAndCount({
                    where:{
                        tenant_id: req.body.tenantID,
                        order_status_code: req.body.orderType,
                        settled_status: req.body.settleStatus
                    },
                    limit: req.body.itemsPerPage,
                    offset: req.body.page * req.body.itemsPerPage,
                    include:[
                        {
                            model: OrderSKUs,
                            as: 'Items',
                            required: true
                        }
                    ]
                })
        })
        .then((orderList) => {
            res.json({status:ErrorTypes.Success, result:{orderList}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};

/**
 * 用户查看订单列表
 * @param req
 * @param res
 * @param next
 */
exports.postUserFindOrderList = (req,res,next) => {

    req.assert('orderStatus','check parameters orderStatus').notEmpty();
    let error = req.validationErrors();
    let paraJson = JSON.parse(req.body.orderStatus);
    if (error && paraJson.length > 0){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then()
        .catch(() => {

        })

};


