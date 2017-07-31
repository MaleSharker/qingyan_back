/**
 * Created by YCYL on 2017/7/28.
 */


const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const Bluebird = require('bluebird');
const CouponStatus = require(global.apiPathPrefix + '/utility/SwallowConst').CouponStatus;

const UserCoupon = DBConfig.UserCoupons();
const Coupon = DBConfig.Coupons();
const sequelize = DBConfig.getSequelize();

/**
 * 获取某店铺的所有优惠券
 * @param req
 * @param res
 */
exports.postFindTenantCoupons = (req,res) => {

    req.assert('tenantID','check parameters tenantID').notEmpty().isInt();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    var tempDisCoupons = [];
    var tempEnCoupons = [];
    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then((user) => {
            return Coupon
                .findAll({
                    where:{
                        tenant_id:tenantID,
                        is_enabled: true
                    }
                })
        })
        .then((coupons) => {
            return new Bluebird((resolve,reject) => {
                if (coupons.length == 0 ){
                    resolve()
                }
                coupons.map((coupon) => {
                    let maxCount = coupon.get('max_grant_count');
                    let grantCount = coupon.get('grant_count');
                    let expireDate = coupon.get('expire_date').getTime();
                    let curDate = (new Date()).getTime();
                    if (curDate >= expireDate || grantCount >= maxCount) {
                        tempDisCoupons.push(coupon.get('coupon_id'));
                    } else {
                        tempEnCoupons.push(coupon.toJSON())
                    }
                });
                resolve();
                });
        })
        .then(() => {
            return Coupon
                .update({
                    is_enabled:false
                },{
                    where:{
                        coupon_id:{
                            $in:tempDisCoupons
                        }
                    },
                    fields:['is_enabled'],
                    limit:tempDisCoupons.length
                })
        })
        .then(() => {
            res.json({status:ErrorTypes.Success, result:{coupons:tempEnCoupons}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};

/**
 * 用户领取优惠券
 * @param req
 * @param res
 * @param next
 */
exports.postDrawCoupon = (req,res,next) => {

    req.assert('couponID','check parameter couponID').notEmpty().isInt();
    req.assert('tenantID','check parameter tenantid').notEmpty().isInt();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'Parameter validate error'})
    }

    let tran = sequelize.transaction();
    var tempUserCoupon;
    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then((user) => {
            return Coupon
                .findOne({
                    where:{
                        coupon_id:req.body.couponID,
                        tenant_id: req.body.tenantID
                    },
                    transaction: tran
                })
        })
        .then((coupon) => {

            return new Bluebird((resolve,reject) => {
                let expireDate = coupon.get('expire_date').getTime();
                let curDate = (new Date()).getTime();
                let maxCount = coupon.get('max_count');
                let count = coupon.get('count') + 1;

                if (expireDate <= curDate || maxCount <= count){
                    reject({error:'优惠券已经失效'});
                }else {
                    UserCoupon
                        .findOrCreate({
                            where:{
                                user_id:req.headers.key,
                                tenant_id: req.body.tenantID,
                                coupon_id: req.body.couponID
                            },
                            defaults:{
                                coupon_name:coupon.get('coupon_name'),
                                expire_date: coupon.get('expire_date'),
                                discount: coupon.get('discount'),
                                status: CouponStatus.waiting,
                                minimum_charge:coupon.get('minimum_charge')
                            },
                            transaction:tran
                        })
                        .spread((userCoupon,create) => {
                            tempUserCoupon = {userCoupon,create};
                            resolve(coupon);
                        })
                        .catch((error) => {
                            reject({error});
                        })
                }
            });
        })
        .then((coupon) => {
            return coupon
                .update({
                    grant_count: coupon.get('grant_count') + 1
                },{
                    fields: ['grant_count'],
                    transaction: tran
                })
        })
        .then(() => {
            tran.commit();
            if (obj.create){
                res.json({status: ErrorTypes.Success, result:{userCoupon: tempUserCoupon.userCoupon}, msg:'领取成功,已放到个人账户'})
            }else{
                res.json({status: ErrorTypes.Error, result:{}, msg:'已经领取过了'})
            }
        })
        .catch((error) => {
            tran.rollback();
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })
};


