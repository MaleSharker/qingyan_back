/**
 * Created by baichenchen on 2017/7/29.
 */


const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const SwallowConst = require(global.apiPathPrefix + '/utility/SwallowConst');
const Bluebird = require('bluebird');

const sequelize = DBConfig.getSequelize();
const Coupons = DBConfig.Coupons();


/**
 * 商铺创建优惠券
 * @param req
 * @param res
 * @param next
 */
exports.postTenantCreateCoupons = (req,res,next) => {

    req.assert('tenantID','check parameter tenantID').notEmpty().isInt();
    req.assert('name', 'check parameter name').notEmpty().isLength(2,20);
    req.assert('maxCount','check parameter maxCount').notEmpty().isInt();
    req.assert('expireDate','check parameter expireDate').notEmpty();
    req.assert('discount','check parameter discount').notEmpty().isDecimal();
    req.assert('minCharge','check parameter minCharge').notEmpty().isDecimal();
    req.assert('isEnabled', 'check parameter isEnabled').notEmpty().isBoolean();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.key, req.headers.token, req.body.tenantID)
        .then((tenant) => {
            return Coupons
                .create({
                    coupon_name: req.body.name,
                    max_grant_count: req.body.maxCount,
                    expire_date: new Date(req.body.expireDate),
                    discount: req.body.discount,
                    minimum_charge: req.body.minCharge,
                    tenant_id: tenant.get('tenant_id'),
                    is_enabled: req.body.isEnabled
                })
        })
        .then((coupon) => {
            res.json({status:ErrorTypes.Success, result:{coupon}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })
};

/**
 * 商铺获取所有优惠券
 * @param req
 * @param res
 * @param next
 */
exports.postFindAllCoupons = (req,res,next) => {

    req.assert('tenantID', 'check parameter tenantID').isInt();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.key, req.headers.token, req.body.tenantID)
        .then((tenant) => {
            return Coupons
                .findAll({
                    where:{
                        tenant_id:tenant.get('tenant_id')
                    }
                })
        })
        .then((coupons) => {
            return res.json({status:ErrorTypes.Success, result:{coupons}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};


/**
 * 商铺下架或修改优惠券
 * @param req
 * @param res
 * @param next
 */
exports.postTenantUpdateCoupon = (req,res,next) => {

    req.assert('tenantID','check parameter tenantID').notEmpty().isInt();
    req.assert('couponID', 'check parameter couponID').notEmpty().isInt();
    req.assert('maxCount','check parameter maxCount').notEmpty().isInt();
    req.assert('isEnabled', 'check parameter isEnabled').notEmpty().isBoolean();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorTypes.ParameterError, result:{error}, msg:'parameters validate error'})
    }

    var tran = sequelize.transaction();

    SwallowUtil
        .validateTenantOperator(req.headers.key, req.headers.token, req.body.tenantID)
        .then((tenant) => {
            return Coupons
                .update({
                    max_grant_count: req.body.maxCount,
                    is_enabled: req.body.isEnabled
                },{
                    where:{
                        tenant_id: tenant.get('tenant_id'),
                        coupon_id: req.body.couponID
                    },
                    fields: ['max_grant_count','is_enabled'],
                    transaction: tran
                })
        })
        .then((succeed) => {
            tran.commit();
            res.json({status:ErrorTypes.Success,result:{succeed},msg:'success'})
        })
        .catch((error) => {
            tran.rollback();
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })
};
