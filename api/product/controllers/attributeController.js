/**
 * Created by baichenchen on 2017/7/16.
 */

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorType = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const Bluebird = require('bluebird');

let Attribute = DBConfig.Attribute();
let AttriChoice = DBConfig.AttriChoice();
let AttriRelation = DBConfig.AttriRelation();
let Tenant = DBConfig.Tenant();
let User = require(global.apiPathPrefix + '/api/user/models/User');

/**
 * 创建属性
 * @param req
 * @param res
 */
exports.postCreateAttribute = (req,res) => {

    req.assert('name','parameter name can not be empty').notEmpty();
    req.assert('tenantID','parameter tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter validate error'})
    }

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Tenant
                .findOne({
                    where:{
                        tenant_id:req.body.tenantID
                    }
                })
        })
        .then((tenant) => {
            return Attribute
                .findOrCreate({where:{
                    name: req.body.name,
                    tenant_id: tenant.get('tenant_id')
                }})
        })
        .then((attribute) => {
            res.json({status:ErrorType.Success,result:{attribute},msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status: ErrorType.Error, result:{error}, msg:'error'})
            }
        })

};

/**
 * 更新attribute
 * @param req
 * @param res
 */
exports.postUpdateAttribute = (req,res) => {

    req.assert('attriID','parameter attriID can not be empty').notEmpty();
    req.assert('name','parameter name can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter error'})
    }

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Attribute
                .update({
                    name:req.body.name
                },{
                    where:{
                        attri_id: req.body.attriID
                    },
                    fields:['name']
                })
        })
        .then((attribute) => {
            res.json({status:ErrorType.Success, result:{attribute}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status:ErrorType.Error, result:{error}, msg:'error'})
            }
        })

};

/**
 * 删除属性
 * @param req
 * @param res
 */
exports.postDeleteAttribute = (req,res) => {

    req.assert('attriID','parameter attriID can not be empty').notEmpty();
    req.assert('tenantID','parameter tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({staut:ErrorType.ParameterError, result:{errors},msg:'error' })
    }

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Tenant
                .findOne({
                    where:{
                        tenant_id:req.body.tenantID
                    }
                })
        })
        .then((tenant) => {
            return User
                .findOne({userID:tenant.get('ownerID')})
        })
        .then((user) => new Bluebird((resolve,reject) => {
            if (user.phone == req.headers.phone){
                resolve();
            }else{
                reject({error: 'user phone can not match'});
            }
        }))
        .then(() => {
            return Attribute
                .destroy({
                    where:{
                        attri_id:req.body.attriID,
                        tenant_id: req.body.tenantID
                    }
                })
        })
        .then((success) => {
            if (success !== 0){
                return res.json({status:ErrorType.Success,result:{success}, msg:'success'})
            }else{
                return res.json({status:ErrorType.DBError,result:{success}, msg:'db error'})
            }
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error,result:{error}, msg:'error'})
            }
        })

};

/**
 * 创建属性选项
 * @param req
 * @param res
 */
exports.postCreateAttriChoices = (req,res) => {

    req.assert('attriID','parameter attriID can not be empty').notEmpty();
    req.assert('attriChoices','parameter choiceNames can not be empty').notEmpty();
    req.assert('tenantID', 'parameter tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.Success,result:{errors},msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.phone, req.headers.token, req.body.tenantID)
        .then(() => {
            return Attribute
                .findOne({
                    where:{
                        attri_id: req.body.attriID
                    }
                })
        })
        .then((attribute) => {
            let choiceList = JSON.parse(req.body.attriChoices);
            let attriID = attribute.get('attri_id');
            var attriChoices = [];
            for (var choice in choiceList){
                let temp = {
                    value:choiceList[choice].value,
                    attribute_id: attriID
                };
                attriChoices.push(temp);
            }

            return AttriChoice
                .bulkCreate(attriChoices)
        })
        .then((choices) => {
            res.json({status:ErrorType.Success, result:{choices}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error,result:{error},msg:'error'})
            }
        })

};

/**
 * 删除属性选项
 * @param req
 * @param res
 */
exports.postDeleteAttriChoice = (req,res) => {

    req.assert('attriID','parameter attriID can not be empty').notEmpty();
    req.assert('choiceID','parameter choiceID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status: ErrorType.Success, result:{errors}, msg: 'parameter validate error'})
    }

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return AttriChoice
                .destroy({
                    where:{
                        attribute_id: req.body.attriID,
                        choice_id: req.body.choiceID
                    }
                })
        })
        .then((success) => {
            if (success == 1){
                return res.json({status:ErrorType.Success, result:{success}, msg:'success'})
            }else {
                return res.json({status:ErrorType.Error, result:{failed:success}, msg:'error'})
            }
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'error'})
            }
        })
};

/**
 * sku 添加属性连接
 * @param req
 * @param res
 */
exports.postCreateAttriRelation = (req,res) => {
    req.assert('choiceID','parameter choiceID can not be empty').notEmpty();
    req.assert('skuID','parameter skuID can not be empty').notEmpty();
    req.assert('tenantID', 'parameter tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.phone, req.headers.token,req.body.tenantID)
        .then(() => {
            return AttriRelation
                .findOrCreate({
                    where:{
                        sku_id:req.body.skuID,
                        choice_id:req.body.choiceID
                    }
                })
        })
        .then((relation) => {
            res.json({status:ErrorType.Success, result:{relation}, msg:'success'})
        })
        .catch((errors) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{errors}, msg:'error'})
            }
        })

};

/**
 * 删除属性选项关联
 * @param req
 * @param res
 */
exports.postDeleteAttriRelation = (req,res) => {
    req.assert('skuID','parameter skuID can not be empty').notEmpty();
    req.assert('choiceID', 'parameter choiceID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter validate errors'})
    }

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return AttriRelation
                .destroy({
                    where:{
                        sku_id:req.body.skuID,
                        choice_id: req.body.choiceID
                    }
                })
        })
        .then((success) => {
            if (success == 1){
                return res.json({status:ErrorType.Success, result:{success}, msg:'success'})
            }else {
                return res.json({status:ErrorType.Error, result:{}, msg:'未找到对应项'})
            }
        })
        .catch((error) => {
            if (!res.finished){
                return res.json({status:ErrorType.Error, result:{error}, msg:'error'})
            }
        })

};

