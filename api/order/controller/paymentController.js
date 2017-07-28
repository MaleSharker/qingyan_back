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


const PaymentChannels = require(global.apiPathPrefix + '/utility/SwallowConst').Channels;
const sequelize = DBConfig.getSequelize();
const OrderModel = DBConfig.OrderModel();
const OrderSKU = DBConfig.OrderSKUs();
const Coupons = DBConfig.Coupons();
const UserCoupons = DBConfig.UserCoupons();
const OrderDeliver = DBConfig.OrderDelivery();
const Payment = DBConfig.Payment();
const Address = DBConfig.Address();

const CouponStatusKV = require(global.apiPathPrefix + '/utility/SwallowConst').CouponStatusKeyValus;

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
    req.assert('couponID','check parameter couponID').notEmpty();
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
                            model: OrderSKU,
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
                if (req.body.couponID.length == 0){
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

            return new Bluebird((resolve, reject) => {
                if (coupon){
                    couponModel = coupon;
                    let curTime = (new Date()).getTime();
                    let expireTime = (new Date(coupon.get('expire_date'))).getTime();
                    if (coupon.get('status') === CouponStatusKV.waiting && curTime < expireTime){
                        coupon
                            .update({
                                status:CouponStatusKV.used
                            },{
                                fields:['status'],
                                transaction: tra
                            })
                            .then(() => {
                                resolve()
                            })
                            .catch((err) => {
                                reject(err)
                            })
                    }else {
                        reject({err:"优惠券已经使用或已经过期"})
                    }
                }
            });
        })
        .then(() => {
            return new Bluebird((resolve,reject) => {

            });
        })

};

