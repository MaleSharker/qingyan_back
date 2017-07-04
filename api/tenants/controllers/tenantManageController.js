/**
 * Created by cc on 17/7/4.
 */

const jwt = require('jsonwebtoken');
const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const ErrorList = require(global.apiPathPrefix + '/errors/errorList');
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');

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

