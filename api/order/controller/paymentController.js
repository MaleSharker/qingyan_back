/**
 * Created by cc on 17/7/27.
 */

const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const SwallowConst = require(global.apiPathPrefix + '/utility/SwallowConst');
const Bluebird = require('bluebird');
const pingpp = require('pingpp')(process.env.PINGPP_KEY);
pingpp.setPrivateKeyPath(global.apiPathPrefix + "/pingpp_rsa_private_key.pem");


const sequelize = DBConfig.getSequelize();
const OrderModel = DBConfig.OrderModel();
const TenantOrder = DBConfig.TenantOrder();
const OrderSKUs = DBConfig.OrderSKUs();
const Coupons = DBConfig.Coupons();
const UserCoupons = DBConfig.UserCoupons();
const OrderDeliver = DBConfig.OrderDelivery();
const OrderRefunded = DBConfig.OrderRefunded();
const Payment = DBConfig.Payment();
const Address = DBConfig.Address();

const OrderStatus = SwallowConst.OrderStatusKeyValue;
const DeliverStauts = SwallowConst.DeliverStatusKeyValue;
const CouponStatusKV = SwallowConst.CouponStatusKeyValus;
const PaymentChannels = require(global.apiPathPrefix + '/utility/SwallowConst').Channels;

var requestModel = {
    subject: "",
    body: "",
    amount: 1,
    order_no: 100,
    channel: "alipay",
    currency: "cny",
    client_ip: "127.0.0.1",
    app: {id: process.env.PINGPP_APP_KEY},
    extra: {
        success_url: "127.0.0.1",
        cancel_url: "127.0.0.1",
        open_id: ""
    }
};

/**
 * 用户获取支付对象
 * @param req
 * @param res
 * @param next
 */
exports.postPayOrder = (req, res, next) => {

    req.assert('userID','check parameter userID').notEmpty();
    // req.assert('userCoupons','check parameter userCouponID').notEmpty(); [{tenantID:'', userCouponID:'', couponID:'' }]
    req.assert('addressID','check parameter addressID').notEmpty();
    req.assert('paymentType','check parameter paymentType').notEmpty().isIn(PaymentChannels);
    req.assert('orderID','check parameter orderID').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorTypes.ParameterError, result:{errors},msg:'parameters validate error'})
    }

    var tra = sequelize.transaction();

    var orderModel;
    var tenantOrdersJson;
    var couponsModel;
    var addressModel;
    var moneyObj;
    var chargeObj;

    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then((user) => {
            //验证订单ID 无误
            return OrderModel
                .findOne({
                    where:{
                        customer_id: user.userID,
                        order_id: req.body.orderID
                    },
                    include:[
                        {
                            model: TenantOrder,
                            as: 'TenantOrders',
                            include: [
                                {
                                    model: OrderSKUs,
                                    as: 'Items'
                                },
                            ]
                        }
                    ],
                    transaction: tra
                })
        })
        .then((order) => {
            orderModel = order;
            //验证地址
            return Address
                .findOne({
                    where:{
                        address_id: req.body.addressID,
                        user_id:req.headers.key
                    },
                    transaction: tra
                })
        })
        .then((address) => {
            addressModel = address;
            var couponsJsonArr = JSON.parse(req.body.userCoupons);
            //为对应商铺绑定对应优惠码 并 获取所有优惠码信息
            return Bluebird((resolve, reject) => {
                if (couponsJsonArr.length == 0 || couponsJsonArr == undefined){
                    resolve()
                }else {
                    let userCouponIDs = [];
                    let orderJson = orderModel.toJSON();
                    tenantOrdersJson = orderJson.TenantOrders;
                    //{tenantID:'', userCouponID:'', couponID:'' }
                    couponsJsonArr.map((userCoupon) => {
                        if (!SwallowUtil.validateContains(userCouponIDs, userCoupon.userCouponID)){
                            userCouponIDs.push(userCoupon.userCouponID);
                            tenantOrdersJson.map((tenantOrder) => {
                                if (tenantOrder.tenant_id == userCoupon.tenantID){
                                    tenantOrder.user_coupon_id = userCoupon.userCouponID;
                                }
                            });
                        }
                    });

                    UserCoupons
                        .findAll({
                            where:{
                                user_coupon_id:{
                                    $in: userCouponIDs
                                },
                                user_id:req.headers.key
                            },
                            transaction: tra
                        })
                        .then((coupon) => {
                            resolve(coupon)
                        })
                        .catch((error) => {
                            reject(error);
                        })
                }
            });
        })
        .then((coupons) => {
            return new Bluebird((resolve,reject) => {
                var totalAmount = 0.0; //订单要支付的总金额
                tenantOrdersJson.map((tenantOrder) => {
                    var tempAmount = 0.0;
                    tenantOrder.Items.map((orderSku) => {
                        tempAmount += orderSku.count * orderSku.sku_price;
                    });
                    let userCouponID = tenantOrder.user_coupon_id;
                    if (userCouponID !== null || userCouponID !== undefined){
                        coupons.map((userCoupon) => {
                            let couponID = userCoupon.get('user_coupon_id');
                            if (userCouponID == couponID) {
                                let status = userCoupon.get('status');
                                let expireTime = userCoupon.get('expire_date').getTime();
                                if (status == CouponStatusKV.waiting && expireTime > (new Date()).getTime()){
                                    let minAmount = userCoupon.get('minimum_charge');
                                    let discount = userCoupon.get('discount');
                                    if (tempAmount >= minAmount){
                                        tempAmount -= discount;
                                    }else {
                                        reject({error:'未能达到使用优惠券的金额'});
                                    }
                                }else {
                                    reject({error:'优惠券已经使用过或者已经过期'})
                                }
                            }
                        });
                    }
                    tempAmount += tenantOrder.logistics_amount;
                    totalAmount += tempAmount;
                });
                resolve({money: totalAmount});
            });
        })
        .then((obj) => {
            moneyObj = obj;
            //更新用户订单表
            return orderModel
                .update({
                    total_amount: obj.money,
                },{
                    fields:['total_amount'],
                    transaction: tra
                });
        })
        .then((update) => {
            //更新商户订单表
            var promiseList = [];
            tenantOrdersJson.map((tenantOrder) => {
                if (!SwallowUtil.validateContains(tempOrderIDs, tenantOrder.tenant_order_id)){
                    promiseList.push(
                        TenantOrder
                            .update({
                                user_address_id: req.body.addressID,
                                user_coupon_id: tenantOrder.tenant_order_id
                            },{
                                where:{
                                    tenant_order_id: tenantOrder.tenant_order_id
                                },
                                transaction: tra
                            })
                    )
                }
            });
            return Bluebird.all(promiseList);
        })
        .then((update) => {
            //向Pingpp请求支付对象
            return new Bluebird((resolve,reject) => {
                if (moneyObj.money <= 0){
                    reject({error:'订单价格有误'})
                }else{
                    requestModel.amount = moneyObj.money * 100;
                    requestModel.order_no = orderModel.get('order_id');
                    requestModel.channel = req.body.paymentType;
                    requestModel.client_ip = req.connection.remoteAddress;
                    requestModel.extra.success_url = process.env.LOCAL_EXTERNAL_IP;
                    requestModel.extra.cancel_url = process.env.LOCAL_EXTERNAL_IP;
                    requestModel.extra.open_id = '';
                    pingpp.chages.create(requestModel,(err,charge) => {
                        if (err){
                            reject(err);
                        }else {
                            resolve(charge);
                        }
                    })
                }
            });
        })
        .timeout(1000 * 10) //10 秒无响应就取消
        .then((charge) => {
            chargeObj = charge;
            return Payment
                .findOrCreate({
                    where:{
                        order_no: orderModel.get('order_id')
                    },
                    defaults:{
                        charge_id: charge.id,
                        object: charge.object,
                        created: charge.created,
                        livemode: charge.livemode,
                        paid: charge.paid,
                        refunded: charge.refunded,
                        app: charge.app,
                        channel: charge.channel,
                        client_ip: charge.client_ip,
                        amount: charge.amount,
                        amount_settle: charge.amount_settle,
                        currency: charge.currency,
                        subject:charge.subject,
                        body: charge.body,
                        extra: charge.extra.toString(),
                        time_paid:charge.time_paid,
                        time_expire: charge.time_expire,
                        time_settle: charge.time_settle,
                        transaction_no: charge.transaction_no,
                        refunds: charge.refunds.toString(),
                        amount_refunded: charge.amount_refunded,
                        failure_code: charge.failure_code,
                        failure_msg: charge.failure_msg,
                        metadata: charge.metadata.toString(),
                        credential: charge.credential.toString(),
                        description: charge.description
                    },
                    transaction: tra
                })
        })
        .then((payment) => {
            tra.commit();
            res.json({status:ErrorTypes.Success, result:{charge:chargeObj}, msg:'success'})
        })
        .catch((error) => {
            tra.rollback();
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};

/**
 * 用户申请退款
 * @param req
 * @param res
 * @param next
 */
exports.postApplyRefundOrder = (req, res, next) => {

    req.assert('orderID','check parameter orderID').isInt();
    req.assert('refundAmount', 'check parameter refundAmount').isFloat();
    req.assert('reason','check parameter reason').notEmpty();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateUser(req.headers.key, req.headers.token)
        .then((user) => {
            return OrderModel
                .findOne({
                    where:{
                        order_id: req.body.orderID
                    }
                })
        })
        .then((order) => {
            return order
                .update({
                    refund_amount: req.body.refundAmount,
                    refund_reason: req.body.reason,
                    order_status_code: OrderStatus.retruning
                },{
                    fields:['refund_amount','refund_reason','order_status_code']
                })
        })
        .then((updated) => {
            res.json({status:ErrorTypes.Success, result:{}, msg:'申请退款成功,等待审核'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{}, msg:'error'})
            }
        })
};

/**
 * 商家同意退款
 * @param req
 * @param res
 * @param next
 */
exports.postTenantRefundOrder = (req, res, next) => {

    req.assert('tenantID','check parameter tenantID').isInt();
    req.assert('orderID','check parameter orderID').isInt();
    req.assert('refundAmount', 'check parameter refundAmount').isFloat();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.key,req.headers.token, req.body.tenantID)
        .then((tenant) => {
            return Payment
                .findOne({
                    where:{
                        order_id: req.body.orderID
                    }
                })
        })
        .then((order) => {
            return new Bluebird((resolve,reject) => {
                let settledAmount = order.get('amount_settle');
                if (settledAmount >= req.body.refundAmount){
                    reject({error:'退款金额有误'});
                }else {
                    pingpp.charges.createRefund(order.get('order_no'),{amount: req.body.refundAmount, description:"refund "},(err,refund) => {
                        if (err){
                            reject(err);
                        }else {
                            resolve(refund);
                        }
                    });
                }
            });
        })
        .then((refund) => {
            return OrderRefunded
                .findOrCreate({
                    where:{
                        order_id:req.body.orderID
                    },
                    defaults:{
                        object_id: refund.id,
                        object: refund.object,
                        order_no: refund.order_no,
                        amount: refund.amount,
                        created: refund.created,
                        succeed: refund.succeed,
                        status: refund.status,
                        time_succeed:refund.time_succeed,
                        description: refund.description,
                        failure_code: refund.failure_code,
                        failure_msg: refund.failure_msg,
                        metadata: refund.metadata.toString(),
                        charge: refund.charge,
                        charge_order_no: refund.charge_order_no,
                        transaction_no: refund.transaction_no
                    }
                })

        })
        .then((refund) => {
            res.json({status:ErrorTypes.Success, result:{refund}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })


};


/**
 * 处理pingpp 支付结果通知
 * @param req
 * @param res
 * @param next
 */
//收款成功
let chargeSuccessHandler = (req,res) => {

    let dataResult = req.body;
    let jsonResult = JSON.parse(dataResult);
    if (!jsonResult){
        res.sendStatus(400);
    }else {
        let orderID = jsonResult.data.object.order_no;
        let tran = sequelize.transaction();
        var addressID;
        var couponID;
        var customerID;
        SwallowUtil
            .validatePingppSignature(req.headers['x-pingplusplus-signature'],dataResult)
            .then(() => {
                return OrderModel
                    .findOne({
                        where:{
                            order_id: orderID
                        },
                        transaction: tran
                    })
            })
            .then((order) => {
                addressID = order.get('user_address_id');
                couponID = order.get('user_coupon_id');
                customerID = order.get('customer_id');
                return order
                    .update({
                        total_amount: jsonResult.data.object.amount,
                        order_status_code: OrderStatus.paymentReceived,
                        date_order_payed: new Date(),
                    },{
                        fields:['total_amount','order_status_code','date_order_payed'],
                        transaction: tran
                    })
            })
            .then((order) => {
                return UserCoupons
                    .findOne({
                        where:{
                            user_id: customerID,
                            user_coupon_id: couponID
                        },
                        transaction: tran
                    })
            })
            .then((userCoupon) => {
                return userCoupon
                    .update({
                        status: CouponStatusKV.used,
                    },{
                        fields: ['status'],
                        transaction: tran
                    })
            })
            .then(() => {
                return Address
                    .findOne({
                        where:{
                            address_id: addressID,
                            user_id: customerID,
                        },
                        transaction: tran
                    })
            })
            .then((address) => {
                let detailAddr = address.get('country') + ' ' + address.get('province') + ' ' + address.get('city') + ' ' + address.get('district') + ' ' + address.get('detail')
                return OrderDeliver
                    .findOrCreate({
                        where:{
                            order_id: orderID
                        },
                        defaults:{
                            logistic_status: DeliverStauts.waitDeliver,
                            deliver_name: address.get('name'),
                            deliver_phone: address.get('phone'),
                            deliver_address: detailAddr
                        },
                        transaction: tran
                    })
            })
            .spread((orderDeliver,created) => {
                tran.commit();
                return res.sendStatus(200);
            })
            .catch((error) => {
                tran.rollback();
                if (!res.finished){
                    res.sendStatus(400);
                }
            })
    }
};

//退款成功
let refundSuccessHandler = (req,res) => {

    let dataResult = req.body;
    let jsonResult = JSON.parse(dataResult);
    if (!jsonResult){
        res.sendStatus(400);
    }else {
        let orderID = jsonResult.data.object.order_no;
        let tran = sequelize.transaction();
        SwallowUtil
            .validatePingppSignature(req.headers["x-pingplusplus-signature"],dataResult)
            .then(() => {
                return OrderModel
                    .update({
                        refund_settled: jsonResult.data.amount,
                        order_status_code: OrderStatus.refunded
                    },{
                        where:{
                            order_id: orderID
                        },
                        fields:['refund_settled','order_status_code'],
                        transaction: tran
                    })
            })
            .then((order) => {
                return OrderRefunded
                    .update({
                        refund_id:jsonResult.id,
                        refund_created: jsonResult.created,
                        livemode:jsonResult.livemode,
                        type: jsonResult.type,
                        pending_webhooks: jsonResult.pending_webhooks,
                        request: jsonResult.request,
                        object: jsonResult.data.object.object,
                        object_id: jsonResult.data.object.object_id,
                        order_no: jsonResult.data.object.order_no,
                        amount: jsonResult.data.object.amount,
                        created: jsonResult.data.object.created,
                        succeed: jsonResult.data.object.succeed,
                        status: jsonResult.data.object.status,
                        time_succeed: jsonResult.data.object.time_succeed,
                        description: jsonResult.data.object.description,
                        failure_code: jsonResult.data.object.failure_code,
                        failure_msg: jsonResult.data.object.failure_msg,
                        metadata: jsonResult.data.object.metadata.toString(),
                        charge: jsonResult.data.object.charge,
                        charge_order_no: jsonResult.data.object.charge_order_no,
                        transaction_no: jsonResult.data.object.transaction_no
                    },{
                        where:{
                            order_id: order.get('order_id')
                        },
                        fields:['refund_id','refund_created','livemode','type','pending_webhooks','request','object','object_id',
                                'order_no','amount','created','succeed','status','time_succeed','description','failure_code','failure_msg',
                                'metadata','charge','charge_order_no','transaction_no'],
                        transaction: tran
                    })
            })
            .then(() => {
                tran.commit();
                res.sendStatus(200);
            })
            .catch((error) => {
                tran.rollback();
                res.sendStatus(400)
            })
    }
};

exports.postExecPingppHook = (req,res,next) => {

    if (req.body.type){
        switch (req.body.type){
            case "charge.succeeded":
                chargeSuccessHandler(req,res);
                break;
            case "refund.succeeded":
                refundSuccessHandler(req,res);
                break;
            default:
                return res.sendStatus(400);
        }
    }else {
        return res.sendStatus(400)
    }



};

