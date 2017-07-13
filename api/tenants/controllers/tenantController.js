/**
 * Created by cc on 17/7/13.
 */

const ErrorType = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const Bluebird = require('bluebird');

const fs = require('fs');

const User = require(global.apiPathPrefix + '/api/user/models/User');

/**
 * 用户创建商铺
 * @param req
 * @param res
 * @param next
 */

exports.postCreateTenant = (req, res, next) => {

    req.assert('name').notEmpty();

    let validateError = req.validationErrors();
    if (validateError) {
        return res.json({status: ErrorType.ParameterError, result:{}, msg:'参数有误'});
    }

    let Tenant = DBConfig.Tenant();

    SwallowUtil.validateUser(req.headers.phone, req.headers.token)
        .then(() => new Bluebird((resolve, reject) => {
            User
                .findOne({phone:req.headers.phone})
                .then((user) => {
                    if (user){
                        resolve({userID:user.userID});
                    }else{
                        reject({error:'can not find user by phone'});
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        }))
        .then((user) => new Bluebird((resoleve, reject) => {
            Tenant
                .findOne({where:{ownerID:user.userID}})
                .then((tenant) => {
                    if (tenant) {
                        res.json({status:ErrorType.Error, result:{tenant}, msg:'商铺已存在,每个账户只可以创建一个商铺'});
                        reject();
                    }else {
                        resoleve({userID:user.userID});
                    }
                })
                .catch((error) => {
                    if (error){
                        reject(error);
                    }
                })
        }))
        .then((user) => new Bluebird((resolve, reject) => {
            if (user){
                Tenant
                    .create({ownerID:user.userID,name:req.body.name})
                    .then((tenant) => {
                        if (tenant){
                            resolve(tenant);
                        }else {
                            reject(tenant)
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    })
            }else{
                reject({error:'不可描述性错误'});
            }
        }))
        .then((tenant) => {
            if (tenant){
                res.json({status: ErrorType.Success, result:{tenant}, msg:'创建/查找成功'})
            }else{
                res.json({status: ErrorType.DBError, result:{}, msg: '创建/查找失败'});
            }
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status: ErrorType.Error, result:{error}, msg:'error'});
            }
        })

};


/**
 * 查找商铺信息
 * @param req
 * @param res
 * @param next
 */
exports.postFindTenant = (req, res, next) => {

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return User
                .findOne({phone:req.headers.phone});
        })
        .then((user) => new Bluebird((resolve, reject) => {
            if (user){
                let Tenant = DBConfig.Tenant();
                Tenant
                    .findOne({where:{ownerID:user.userID}})
                    .then((tenant) => {
                        if (tenant){
                            resolve(tenant);
                        }else{
                            reject({error:'未找到对应商铺信息'})
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    })
            }else {
                reject({error:'没有该用户的信息'});
            }
        }))
        .then((tenant) => {
            if (tenant){
                res.json({status:ErrorType.Success,result:{tenant}, msg:'success'});
            }else{
                res.json({status:ErrorType.DBError,result:{}, msg:'没有商铺信息'});
            }
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status:ErrorType.Error, result:{error}, msg:'error'});
            }
        })

};


/**
 * 更新商铺信息
 * @param req
 * @param res
 * @param next
 */
exports.postUpdateTenant = (req, res, next) => {

    req.assert('tenantID','tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.DBError, result:{errors}, msg:'validate error'})
    }

    let Tenant = DBConfig.Tenant();

    SwallowUtil.validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Tenant
                .findOne({where:{tenant_id:req.body.tenantID}})
        })
        .then((tenant) => {
            return tenant
                .update({
                    name: req.body.name == undefined ? tenant.get('name') : req.body.name,
                    descText: req.body.desc == undefined ? tenant.get('descText') : req.body.desc,
                    status: req.body.status == undefined ? tenant.get('status') : req.body.status
                },{
                    fields: ['name','descText','status'],
                    validate: true
                })
        })
        .then((tenant) => {
            res.json({status: ErrorType.Success, result:{tenant}, msg:'更新成功'})
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status:ErrorType.Error,result:{error}, msg:'更新失败'})
            }
        })

};

/**
 * 上传商铺图片
 * @param req
 * @param res
 * @param next
 */
exports.postUploadTenantImage = (req, res, next) => {

    req.assert('tenantID','tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'validate error'});
    }

    var imgName;
    var oldImgName;
    let Tenant = DBConfig.Tenant();
    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Tenant
                .findOne({where:{tenant_id:req.body.tenantID}})
        })
        .then((tenant) => new Bluebird((resolve, reject) => {
            if (tenant){
                oldImgName = tenant.get('descUrl');
                let imgFiles = req.files.imageFile;
                imgName = SwallowUtil.md5Encode((new Date()).getTime().toString() + tenant.get('tenant_id')) + '.jpg';
                imgFiles.mv(global.apiPathPrefix + `/uploads/tenantImages/${imgName}`,(error) => {
                    if (error) {
                        reject(error);
                    }else {
                        resolve(tenant);
                    }
                })
            }
        }))
        .then((tenant) => {
            console.log('- - - ',tenant);
            return tenant
                .update({
                    descUrl:imgName
                },{
                    validate:true,
                    fields: ['descUrl']
                })
        })
        .then((tenant) => new Bluebird((resolve, reject) => {
            if (tenant){
                fs.unlink(global.apiPathPrefix + `/uploads/tenantImages/${oldImgName}`, (error) => {
                    if (error){
                        reject(error);
                    }else {
                        resolve(tenant)
                    }
                })
            }else{
                reject({error:'can not update new image'});
            }
        }))
        .then((tenant) => {
            res.json({status:ErrorType.Success, result:{url: 'http://localhost:3000/tenantImages/' + tenant.get('descUrl')}, msg: '上传成功'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'上传失败'})
            }
        })
};

