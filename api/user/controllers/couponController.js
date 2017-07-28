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

exports.postDrawCoupon = (req,res,next) => {

    req.assert('couponID','check parameter couponID').notEmpty().isInt();
    req.assert('tenantID','check parameter tenantid').notEmpty().isInt();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'Parameter validate error'})
    }

    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then((user) => {
            return Coupon
                .findOne({
                    where:{
                        coupon_id:req.body.couponID,
                        tenant_id: req.body.tenantID
                    }
                })
        })
        .then((coupon) => {
            return UserCoupon
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
                        status: CouponStatus.waiting
                    }
                })
        })
        .spread((userCoupon,create) => {
            if (create){
                res.json({status: ErrorTypes.Success, result:{userCoupon}, msg:'领取成功,已放到个人账户'})
            }else{
                res.json({status: ErrorTypes.Error, result:{}, msg:'已经领取过了'})
            }
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })
};


