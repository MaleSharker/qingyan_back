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
const OrderSKUs = DBConfig.OrderSKUs();
const Coupons = DBConfig.Coupons();
const UserCoupons = DBConfig.UserCoupons();
const OrderDeliver = DBConfig.OrderDelivery();
const Payment = DBConfig.Payment();
const Address = DBConfig.Address();

const CouponStatusKV = require(global.apiPathPrefix + '/utility/SwallowConst').CouponStatusKeyValus;
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


exports.postPayOrder = (req, res, next) => {

    req.assert('userID','check parameter userID').notEmpty();
    // req.assert('userCouponID','check parameter userCouponID').notEmpty();
    req.assert('addressID','check parameter addressID').notEmpty();
    req.assert('paymentType','check parameter paymentType').notEmpty().isIn(PaymentChannels);
    req.assert('orderID','check parameter orderID').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorTypes.ParameterError, result:{errors},msg:'parameters validate error'})
    }

    var tra = sequelize.transaction();

    var orderModel;
    var couponModel;
    var addressModel;
    var moneyObj;

    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then((user) => {
            return OrderModel
                .findOne({
                    where:{
                        customer_id: user.userID,
                        order_id: req.body.orderID
                    },
                    include:[
                        {
                            model: OrderSKUs,
                            as: 'Items'
                        }
                    ]
                })
        })
        .then((order) => {
            orderModel = order;
            return Address
                .findOne({
                    where:{
                        address_id: req.body.addressID,
                        user_id:req.headers.key
                    }
                })
        })
        .then((address) => {
            addressModel = address;
            return new Bluebird((resolve, reject) => {
                if (req.body.userCouponID.length == 0 || req.body.userCouponID == undefined){
                    resolve()
                }else {
                    UserCoupons
                        .findOne({
                            where:{
                                user_coupon_id:req.body.couponID,
                                user_id:req.headers.key
                            }
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
        .then((coupon) => {
            couponModel = coupon;
            //订单总价核算
            return new Bluebird((resolve, reject) => {
                let skus = orderModel.get('Items');
                var money = 0.0;
                skus.map((sku) => {
                    let price = sku.get('sku_price');
                    let count = sku.get('count');
                    money += price * count;
                });
                if (coupon){
                    let discount = coupon.get('discount');
                    let minCharge = coupon.get('minimum_charge');
                    if (money >= minCharge){
                        money -= discount;
                        resolve({money});
                    }else {
                        reject({error:'优惠券不可用'});
                    }
                }else{
                    resolve({money})
                }
            });
        })
        .then((obj) => {
            moneyObj = obj;
            return orderModel
                .update({
                    user_coupon_id: req.body.userCouponID.length > 0 ? req.body.userCouponID : null,
                    user_address_id: req.body.addressID
                },{
                    fields:['user_coupon_id','user_address_id']
                });
        })
        .then((update) => {
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
        .timeout(1000 * 3)
        .then((charge) => {
            res.json({status:ErrorTypes.Success, result:{charge}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};

