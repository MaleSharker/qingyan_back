/**
 * Created by cc on 17/7/14.
 */

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorType = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const Bluebird = require('bluebird');

/**
 * 商铺创建品牌
 * @param req
 * @param res
 * @param next
 */
exports.postCreateBrand = (req, res, next) => {

    req.assert('tenantID','parameter tenantID can not be empty').notEmpty();
    req.assert('name','parameter name can not be empty').notEmpty();
    req.assert('desc').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'validate parameter error'})
    }

    let Tenant = DBConfig.Tenant();
    let Brand = DBConfig.Brand();

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Tenant
                .findOne({where:{tenant_id: req.body.tenantID}})
        })
        .then((tenant) => {
            return Brand
                .create({
                    name:req.body.name,
                    description: req.body.desc,
                    tenant_id:tenant.get('tenant_id')
                })
        })
        .then((brand) => {
            res.json({status:ErrorType.Success, result:{brand}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'error'});
            }
        })

};

/**
 * 更新店铺描述
 * @param req
 * @param res
 */
exports.postUpdateBrand = (req, res) => {

    req.assert('brandID','parameter brandID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors},msg:'parameter validate error'})
    }

    let Brand = DBConfig.Brand();
    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Brand
                .findOne({where:{brand_id:req.body.brandID}})
        })
        .then((brand) => {
            return brand
                .update({
                    name:req.body.name == undefined ? brand.get('name') : req.body.name,
                    description:req.body.desc == undefined ? brand.get('description') : req.body.desc
                },{
                    fields:['name','description'],
                    validate: true
                })
        })
        .then((brand) => {
            res.json({status: ErrorType.Success, result: {brand}, msg:'更新成功'});
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status:ErrorType.Error,result:{error}, msg:'error'})
            }
        })

};

/**
 * 查询所有品牌
 * @param req
 * @param res
 */
exports.postFindAllBrand = (req,res) => {

    req.assert('tenantID','parameter tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter validate failed'});
    }

    let Brand = DBConfig.Brand();

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Brand
                .findAll({where:{tenant_id:req.body.tenantID}})
        })
        .then((brands) => {
            res.json({status:ErrorType.Success, result:{brands}, msg:'success'});
        })
        .catch((errors) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{errors}, msg:'error'})
            }
        })

};

/**
 * 上传品牌图片
 * @param req
 * @param res
 */
exports.postUploadBrandImg = (req, res) => {

    req.assert('brandID','parameter brandID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter error'})
    }

    let Brand = DBConfig.Brand();
    var imgName;

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Brand
                .findOne({where:{brand_id:req.body.brandID}})
        })
        .then((brand) => new Bluebird((resolve, reject) => {
            let imgFile = req.files.imgFile;
            imgName = SwallowUtil.md5Encode((new Date()).getTime().toString() + brand.get('brand_id')) + '.jpg'
            imgFile.mv(global.apiPathPrefix + `/uploads/brandImages/${imgName}`,(err) => {
                if (err){
                    reject(err);
                }else{
                    resolve(brand);
                }
            })
        }))
        .then((brand) => {
            return brand
                .update({
                    icon:imgName
                },{
                    fields:['icon'],
                    validate: true
                })
        })
        .then((brand) => {
            res.json({status:ErrorType.Success, result:{brand}, msg:'上传成功'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'error'})
            }
        })

};


