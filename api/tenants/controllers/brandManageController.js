/**
 * Created by cc on 17/7/6.
 */

const Tenant = require('../models/tenantModel');
const Brand = require('../models/mdseBrandModel');

const ErrorList = require(global.apiPathPrefix + '/errors/errorList');
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const Promise = require('bluebird');
// const Schema = require('mongoose').Schema;

exports.postTenantCreateBrand = (req, res, next) => {

    SwallowUtil.validateUser(req.headers.phone, req.headers.token)
        .then(() => new Promise((resolve, reject) => {
            Tenant
                .findOne({tenantID:req.body.tenantID, ownerID: req.body.userID})
                .then((tenanat) => {
                    if (tenanat){
                        return resolve(tenanat);
                    }
                    reject({error:'未找到对应商铺'});
                })
                .catch((error) => {
                    reject({error})
                })
        }))
        .then((tenant) => new Promise((resolve, reject) => {
            let brand = new Brand();
            brand._creater = tenant._id;
            console.log(brand._creater);
            brand.name = req.body.name || '';
            brand.description = req.body.description || '';
            brand.tenantID = req.body.tenantID;
            brand
                .save()
                .then((obj) => {
                    if (obj){
                        if (tenant.brandList){
                            tenant.brandList.push(obj);
                        }else {
                            tenant.brandList = [{obj}];
                        }
                        return resolve(tenant,obj);
                    }
                    reject({error:'创建品牌失败'});
                })

        }))
        .then((tenant,brand) => {
            tenant
                .save()
                .then((obj) => {
                    if (obj){
                        res.json({status:ErrorList.ErrorType.Success, result:{}, msg:'添加品牌成功'})
                    }else {
                        brand
                            .remove()
                            .then((obj) => {
                                res.json({status:ErrorList.ErrorType.DBError, result:{obj}, msg:'添加品牌失败'})
                            })
                            .catch((error) => {
                                res.json({status:ErrorList.ErrorType.DBError, result:{error}, msg:'添加品牌失败'})
                            })
                    }
                })
                .catch((error) => {
                    brand
                        .remove()
                        .then((obj) => {
                            res.json({status:ErrorList.ErrorType.DBError, result:{obj}, msg:'添加品牌失败'})
                        })
                        .catch((error) => {
                            res.json({status:ErrorList.ErrorType.DBError, result:{error}, msg:'添加品牌失败'})
                        });
                    res.json({status: ErrorList.ErrorType.Error, result:{error}, msg:'保存品牌索引失败'})
                })
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorList.ErrorType.Error, result:{error}, msg: '操作失败'})
            }
        })

};







