/**
 * Created by cc on 17/7/24.
 */

const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const Bluebird = require('bluebird');

let ShoppingCart = DBConfig.ShoppingCart();

/**
 * 增删改购物车商品SKU
 * @param req
 * @param res
 * @param next
 */
exports.setShoppingCart = (req, res, next) => {

    req.assert('actionType','check parameters actionType').notEmpty().isIn(['update','del']);
    req.assert('skuID','check parameters skuID').notEmpty();
    req.assert('tenantID', 'check parameters tenantID').notEmpty();
    req.assert('count', 'check parameter count').isInt();
    let error = req.validationErrors();
    if (error || req.body.count <= 0){
        return res.json({status:ErrorTypes.Success, result:{error}, msg:'parameters validate error'})
    }

    SwallowUtil
        .validateUser(req.headers.key, req.headers.token)
        .then((user) => {
            return ShoppingCart
                .findOrCreate({
                    where:{
                        sku_id: req.body.skuID,
                        user_id: user.userID
                    },
                    defaults:{
                        tenant_id: req.body.tenantID,
                        sku_count: req.body.count,
                    }
                });
        })
        .spread((cartItem,created) => {
            if (created){
                return res.json({status:ErrorTypes.Success, result:{cartItem}, msg:'success'})
            }
            if (req.body.actionType == 'update' && req.body.count > 0){
                return cartItem
                    .update({
                        sku_count:req.body.count
                    },{
                        fields:['sku_count']
                    })
            }else if (req.body.actionType == 'del' || req.body.count == 0){
                return cartItem
                    .destroy();
            }else {
                throw new Error()
            }
        })
        .then((item) => {
            res.json({status:ErrorTypes.Success, result:{item}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};

/**
 * 获取购物车列表
 * @param req
 * @param res
 * @param next
 */
exports.postShopCartList = (req,res,next) => {

    var cartResult = {cartList:[]};
    SwallowUtil
        .validateUser(req.headers.key, req.headers.token)
        .then((user) => {
            return ShoppingCart
                .findAll({
                    where:{
                        user_id:user.userID
                    }
                })
        })
        .then((cartItems) => {
            var tempList = [];
            var rankList = [];
            for (var i in cartItems){
                let item = cartItems[i].toJSON();
                tempList.push(item)
            }
            rankList = tempList.sort((sec,fir) => {
                return fir.tenant_id < sec.tenant_id
            });

            var tempObj;
            rankList.map((value) => {
                if (!tempObj){
                    tempObj = { skus:[], tenantID: 0};
                    tempObj.tenantID = value.tenant_id;
                    tempObj.skus = [];
                    tempObj.skus.push(value);
                }else{
                    if (tempObj.tenantID == value.tenant_id){
                        tempObj.skus.push(value)
                    }else {
                        cartResult.cartList.push(tempObj);
                        tempObj = { skus:[], tenantID: 0};
                        tempObj.tenantID = value.tenant_id;
                        tempObj.skus = [];
                        tempObj.skus.push(value);
                    }
                }
            });
            cartResult.cartList.push(tempObj);

        })
        .then(() => {
            res.json({status:ErrorTypes.Success, result:cartResult, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status: ErrorTypes.Error, result:{error}, msg:'error'})
            }
        })

};

