/**
 * Created by cc on 17/7/4.
 */

const jwt = require('jsonwebtoken');
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const ErrorList = require(global.apiPathPrefix + '/errors/errorList');
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const fileUpload = require('express-fileupload');

const Tenant = require('../models/tenantModel');
const User = require(global.apiPathPrefix + '/api/user/models/User');

exports.postCreateTenant = (req, res) => {

    var validateion = () => new Promise((resolve, reject) => {
        if (SwallowUtil.verifyPhoneNumber(req.headers.phone)){
            jwt.verify(req.headers.token,process.env.TOKEN_SECRET, (error, decode) => {
                if (decode && decode.msg == req.headers.phone){
                    resolve();
                }
            });
        }else {
            reject()
        }
    });

    var docCounts = () => new Promise((resolve, reject) => {
        Tenant.count({},(error, count) => {
            if (error){
                reject(error);
            }else {
                resolve({count});
            }
        });
    });

    validateion()
        .then(docCounts)
        .then((obj) => new Promise((resolve, reject) => {
            if (obj) {
                let tenantID = obj.count + 1;
                User
                    .findOne({phone:req.headers.phone})
                    .then((user) => {
                        user.tenantID = tenantID;
                        user.save()
                            .then((user) => {
                                if (user){
                                    resolve({tenantID,userID:user.userID});
                                }else{
                                    reject();
                                }
                            })
                            .catch((error) => {
                                reject(error);
                            })
                    })
                    .catch((error) => {
                        reject(error);
                    })
            }else {
                reject()
            }
        }))
        .then((obj) => new Promise((resolve, reject) => {
            if (obj){
                let tenant = new Tenant({
                    tenantID: obj.tenantID,
                    status: 'close',
                    ownerID: obj.userID
                });
                resolve(tenant);
            }else {
                reject()
            }
        }))
        .then((tenant) => {
            tenant
                .save()
                .then((tempTenant) => {
                    if (tempTenant){
                        res.json({status:ErrorList.ErrorType.Success, result:{tempTenant}, msg:'创建店铺成功'});
                    }else {
                        res.json({status:ErrorList.ErrorType.DBError, result:{}, msg:'创建失败'});
                    }
                })
                .catch((error) => {
                    if (!res.finished) {
                        res.json({status: ErrorList.ErrorType.Error, result:{error}, msg:''})
                    }
                })
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status: ErrorList.ErrorType.Error, result:{error}, msg:''})
            }
        })

};


/**
 * 更改商铺状态
 */
exports.postUpdateTenantStatus = (req, res, next) => {

    SwallowUtil.validateUser(req.headers.phone, req.headers.token)
        .then(() => new Promise((resolve, reject) => {
            User
                .findOne({phone:req.headers.phone})
                .then((user) => {
                    if (user) {
                        resolve({userID:user.userID})
                    }else {
                        reject()
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        }))
        .then((obj) => new Promise((resolve, reject) => {
            Tenant
                .findOne({ownerID:obj.userID})
                .then((tenant) => {
                    if (tenant){
                        resolve(tenant);
                    }else {
                        reject({error:'用户尚未开通店铺',obj});
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        }))
        .then((tenant) => {
            tenant.status = req.body.status;
            tenant
                .save()
                .then((obj) => {
                    if (!res.finished){
                        res.json({status:ErrorList.ErrorType.Success, result:{tenant:obj}, msg:'修改状态成功'});
                    }
                })
                .catch((error) => {
                    if (!res.finished){
                        res.json({status:ErrorList.ErrorType.DBError, result:{error}, msg:'修改状态失败'})
                    }
                })
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status:ErrorList.ErrorType.Error, result:{error}, msg:'操作失败'})
            }
        })
};

/**
 * 更改商铺信息
 * @param req : tenantID, userID, name, description
 * @param res
 * @param next
 */

exports.postUpdateTenantDesc = (req, res, next) => {

    SwallowUtil
        .validateUser(req.headers.phone,req.headers.token)
        .then(() => new Promise((resolve, reject) => {
            Tenant
                .findOne({tenantID:req.body.tenantID, ownerID:req.body.userID})
                .then((tenant) => {
                    if (tenant){
                        resolve(tenant);
                    }else {
                        reject({error:'查询错误'});
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        }))
        .then((tenant) => {
            if  (req.body.name){
                tenant.name = req.body.name;
            }
            tenant.tenantDesc.descText = req.body.description;
            tenant
                .save()
                .then((obj) => {
                    if (obj){
                        res.json({status:ErrorList.ErrorType.Success, result:{}, msg:'修改成功'})
                    }else {
                        res.json({status:ErrorList.ErrorType.DBError, result:{}, msg:'保存失败'})
                    }
                })
                .catch((error) => {
                    res.json({status: ErrorList.ErrorType.Error, result:{error}, msg:'保存失败'})
                })
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorList.ErrorType.Error, result:{error}, msg:'操作失败'})
            }
        })
};

/**
 * 用户更新商铺图片
 * @param req: userID, tenantID
 * @param res
 * @param next
 */

exports.postUploadTenantImage = (req, res, next) => {


    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => new Promise((resolve, reject) => {
            Tenant
                .findOne({tenantID:req.body.tenantID, ownerID: req.body.userID})
                .then((tenant) => {
                    if (tenant) {
                        console.log("find - - - %s",tenant.name);
                        resolve(tenant);
                    }else{
                        reject({error:'未找到对应商铺'});
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        }))
        .then((tenant) => new Promise((resolve, reject) => {
            console.log("img name - - s");
            let imgFile = req.files.imageFile;
            let imgName = SwallowUtil.md5Encode((new Date()).getTime().toString()) + '.jpg';
            tenant.tenantDesc.descUrl = imgName;
            console.log("img name - - %s",imgName);
            imgFile.mv(global.apiPathPrefix + `/uploads/tenantImages/${imgName}`,(error) => {
                if (error) {
                    reject(error);
                }else {

                    resolve(tenant);
                }
            })
        }))
        .then((tenant) => {
            console.log("- - - save");
            tenant
                .save()
                .then((obj) => {
                    if (obj){
                        res.json({status:ErrorList.ErrorType.Success, result:{tenant}, msg:'更新商铺图片成功'})
                    }else {
                        res.json({status:ErrorList.ErrorType.DBError, result:{}, msg:'图片保存失败'})
                    }
                })
                .catch((error) => {
                    if (!res.finished) {
                        res.json({status:ErrorList.ErrorType.Error, result:{error}, msg:'保存操作失败'})
                    }
                })
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status:ErrorList.ErrorType.Error, result:{error}, msg:'操作失败'})
            }
        })

};
