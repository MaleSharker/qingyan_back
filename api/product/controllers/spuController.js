/**
 * Created by cc on 17/7/13.
 */

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorType = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const Bluebird = require('bluebird');


/**
 * 创建 SPU
 * 不包含商品详情图
 * @param req
 * @param res
 * @param next
 */
exports.postCreateSPU = (req, res, next) => {

    req.assert('categoryID','parameter categoryID can not be empty').notEmpty();
    req.assert('brandID','parameter brandID can not be empty').notEmpty();
    req.assert('name', 'parameter name can not be empty').notEmpty();
    req.assert('brief', 'parameter brief can not be empty').notEmpty();
    req.assert('detail', 'parameter detail can not be empty').notEmpty();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorType.ParameterError, result:{error}, msg:'parameter validate error'});
    }

    let Brand = DBConfig.Brand();
    let Category = DBConfig.Category();
    let SPU = DBConfig.SPU();

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Brand
                .findOne({where:{brand_id:req.body.brandID}})
        })
        .then((brand) => {
            return Category
                .findOne({where:{category_id:req.body.categoryID}})
        })
        .then((category) => {
            return SPU
                .create({
                    category_id:req.body.categoryID,
                    brand_id: req.body.brandID,
                    name: req.body.name,
                    brief: req.body.brief,
                    detail: req.body.detail,
                })
        })
        .then((spu) => {
            res.json({status:ErrorType.Success, result:{spu}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'error'});
            }
        })

};


/**
 * 获取品牌商品列表
 * page 从 1 开始
 * @param req
 * @param res
 * @param next
 */
exports.postTenantAllSPU = (req,res,next) => {

    req.assert('brandID','parameter brandID can not be empty').notEmpty();
    req.assert('page','parameter page can not be empty').isInt();
    req.assert('items_per_page', 'parameter items_per_page can not be empty').isInt();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter validate error'})
    }

    let Brand = DBConfig.Brand();
    let SPU = DBConfig.SPU();

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Brand
                .findOne({where:{brand_id:req.body.brandID}})
        })
        .then((brand) => {
            return SPU
                .findAndCount({
                    where:{
                        brand_id: req.body.brandID,
                    },
                    offset: (parseInt(req.body.page) - 1) * parseInt(req.body.items_per_page),
                    limit: parseInt(req.body.items_per_page)
                })
        })
        .then((spus) => {
            res.json({status:ErrorType.Success, result:{spus}, msg:'success'});
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error,result:{error},msg:'postTenantAllSPU catched error'})
            }
        })

};


exports.postCategoryAllSPU = (req, res, next) => {

    req.assert('categoryID','parameter categoryID can not be empty').isInt();
    req.assert('page', 'parameter page can not be empty').isInt();
    req.assert('items_per_page', 'parameter items_per_page can not be empty').isInt();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {

        })

};
