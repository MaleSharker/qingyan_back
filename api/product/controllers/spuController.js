/**
 * Created by cc on 17/7/13.
 */

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorType = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const Bluebird = require('bluebird');
const fs = require('fs');

let SPU = DBConfig.SPU();
let SKU = DBConfig.SKU();
let Brand = DBConfig.Brand();
let SPUImages = DBConfig.SPUImages();
let Attribute = DBConfig.Attribute();
let AttriChoice = DBConfig.AttriChoice();
let AttriRelation = DBConfig.AttriRelation();

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

/**
 * 分类获取 SPU 列表
 * page, categoryID, items_per_page
 * @param req
 * @param res
 * @param next
 */
exports.postCategoryAllSPU = (req, res, next) => {

    req.assert('categoryID','parameter categoryID can not be empty').isInt();
    req.assert('page', 'parameter page can not be empty').isInt();
    req.assert('items_per_page', 'parameter items_per_page can not be empty').isInt();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameters validate error'})
    }

    let SPU = DBConfig.SPU();
    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return SPU
                .findAndCount({
                    where:{
                        category_id: req.body.categoryID
                    },
                    offset: (parseInt(req.body.page) - 1) * parseInt(req.body.items_per_page),
                    limit: parseInt(req.body.items_per_page)
                })
        })
        .then((spus) => {
            return res.json({status:ErrorType.Error, result:{spus}, msg: 'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'error'})
            }
        })
};

/**
 * 上传SPU详情图
 * @param req
 * @param res
 * @param next
 */
exports.postUploadSPUDetailImages = (req,res,next) => {
    if(req.body.spuID == undefined || req.body.imgRank == undefined){
        return res.json({status:ErrorType.ParameterError, result:{error:'请检查参数'}, msg:'parameter validate error'})
    }

    let SPU = DBConfig.SPU();
    let SPUImage = DBConfig.SPUImages();

    var imgName;

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return SPU
                .findOne({where:{spu_id: req.headers.spuID}})
        })
        .then((spu) => new Bluebird((resolve,reject) => {
            SPUImage
                .findOrCreate({
                    where:{
                        spu_id:req.body.spuID,
                        image_rank: req.body.imgRank
                    },
                    defaults:{
                        image_name:''
                    }
                })
                .spread((spuImage,created) => {
                    if (created){
                        resolve(spuImage);
                    }else{
                        let imgName = global.apiPathPrefix + `/uploads/spuImages/${spuImage.get('image_name')}`;
                        fs.unlink(imgName, (error) => {
                            resolve(spuImage);
                        })
                    }
                })
                .catch((error) => {
                    reject(error);
                })
        }))
        .then((spuImage) => new Bluebird((resolve, reject) => {

            let imgFile = req.files.imgFile;
            imgName = SwallowUtil.md5Encode((new Date()).getTime().toString() + spuImage.get('spu_id')) + '.jpg'

            imgFile.mv(global.apiPathPrefix + `/uploads/spuImages/${imgName}`,(err) => {
                if (err){
                    reject(err);
                }else {
                    resolve(spuImage);
                }
            })

        }))
        .then((spuImage) => {
            return spuImage
                .update({
                    image_name:imgName
                },{
                    fields:['image_name'],
                    validate:true
                })
        })
        .then((spuImage) => {
            res.json({status:ErrorType.Success, result:{imgName:spuImage.get('image_name')},msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error,result:{error},msg:'error'})
            }
        })

};

/**
 * 获取 SPU 详情
 * @param req
 * @param res
 * @param next
 */
exports.postSPUDetail = (req, res, next) => {
    req.assert('spuID','parameter spuID can not be empty').notEmpty();
    req.assert('tenantID', 'parameter tenantID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter validate error'})
    }

    var detailObj = {};
    SwallowUtil
        .validateTenantOperator(req.headers.phone, req.headers.token, req.body.tenantID)
        .then((tenant) => {
            detailObj.tenant = tenant.toJSON();
            return SPU
                .findOne({
                    where:{
                        spu_id: req.body.spuID
                    }
                })
        })
        .then((spu) => {
            detailObj.spu = spu.toJSON();
            return Brand
                .findOne({
                    where:{
                        brand_id: spu.get('brand_id')
                    }
                })
        })
        .then((brand) => {
            detailObj.brand = brand.toJSON();
            return SPUImages
                .findAll({
                    where:{
                        spu_id: detailObj.spu.spu_id
                    }
                })
        })
        .then((images) => {
            detailObj.images = [];
            images.map((image) => {
                detailObj.images.push(image.toJSON())
            });
            return SKU
                .findAll({
                    where: {
                        spu_id: detailObj.spu.spu_id
                    }
                });
        })
        .then((skus) => {
            detailObj.skus = [];
            skus.map((sku) => {
                detailObj.skus.push(sku)
            });
            var skuIDs = [];
            for (var i in skus){
                let id = skus[i].sku_id;
                skuIDs.push(id);
            }
            return AttriRelation
                .findAll({
                    where:{
                        sku_id:{
                            $in:skuIDs
                        }
                    }
                })
        })
        .then((relations) => {
            detailObj.attriRelations = [];
            relations.map((relation) => {
                detailObj.attriRelations.push(relation.toJSON());
            });
            var attriIDs = [];
            for (var i in relations){
                let attriID = relations[i].get('attri_id');
                if (!SwallowUtil.validateContains(attriIDs,attriID)){
                    attriIDs.push(attriID);
                }
            }
            return Attribute
                .findAll({
                    where:{
                        attri_id:{
                            $in:attriIDs
                        }
                    }
                })
        })
        .then((attributes) => {
            detailObj.attributes = [];
            attributes.map((attribute) => {
                detailObj.attributes.push(attribute.toJSON())
            });
            var choiceIDs = [];
            for (var i in detailObj.attriRelations){
                detailObj.attributes[i].choices = [];
                let choiceID = detailObj.attriRelations[i].choice_id;
                if (!SwallowUtil.validateContains(choiceIDs,choiceID)){
                    choiceIDs.push(choiceID)
                }
            }
            return AttriChoice
                .findAll({
                    where:{
                        choice_id:{
                            $in:choiceIDs
                        }
                    }
                })

        })
        .then((choices) => {
            choices.map((choice) => {
                for (var i in detailObj.attributes){
                    let attriID = detailObj.attributes[i].attri_id;
                    if (choice.get('attribute_id') == attriID){
                        detailObj.attributes[i].choices.push(choice.toJSON())
                    }
                }
            });
            res.json({attributes:detailObj})
        })
        .catch((errors) => {
            if (!res.finished) {
                res.json({status:ErrorType.Error,result:{errors}, msg:'error'})
            }
        })

};

/**
 * 创建 SKU
 * @param req
 * @param res
 * @param next
 */
exports.postCreateSKU = (req, res, next) => {
    req.assert('spuID','parameter spuID can not be empty').notEmpty();
    req.assert('tenantID','parameter tenantID can not be empty').notEmpty();
    req.assert('name','parameter name can not be empty').notEmpty();
    req.assert('price','parameter price can not be empty').notEmpty();
    req.assert('stock','parameter stock can not be empty').isInt();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateTenantOperator(req.headers.phone, req.headers.token, req.body.tenantID)
        .then((tenanat) => {
            // console.log('1 - - - ',tenanat);
            return SPU
                .findOne({
                    where:{
                        spu_id:req.body.spuID
                    }
                })
        })
        .then((spu) => {
            return SKU
                .create({
                    name:req.body.name,
                    spu_id:spu.get('spu_id'),
                    price: req.body.price,
                    stock: req.body.stock
                })
        })
        .then((sku) => {
            res.json({status:ErrorType.Success, result:{sku}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Success, result:{error}, msg:'error'})
            }
        })

};


/**
 * 删除 SKU
 * @param req
 * @param res
 * @param next
 */
exports.postDeleteSKU = (req,res,next) => {
    req.assert('tenantID','parameter tenantID can not be empty').notEmpty();
    req.assert('skuID','parameter skuID can not be empty').notEmpty();
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorType.ParameterError, result:{errors}, msg:'parameter validate error'})
    }


    SwallowUtil
        .validateTenantOperator(req.headers.phone, req.headers.token, req.body.tenantID)
        .then(() => {
            return SKU
                .findOne({
                    where:{
                        sku_id:req.body.skuID
                    }
                })
        })
        .then((sku) => {
            return sku.getAttriRelations();
        })
        .then((relations) => {
            let relationIDs = [];
            for (var i in relations){
                relationIDs.push(relations[i].attri_relation_id)
            }

            return AttriRelation
                .destroy({
                    where:{
                        attri_relation_id:{
                            $in:relationIDs
                        },
                    }
                })
        })
        .then(() => {
            return SKU
                .destroy({
                    where:{
                        sku_id:req.body.skuID
                    }
                })
        })
        .then(() => {
            res.json({status:ErrorType.Success,result:{},msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'error'})
            }
        })
};
