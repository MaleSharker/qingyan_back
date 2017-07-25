/**
 * Created by cc on 17/7/24.
 */

const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const Bluebird = require('bluebird');

let Address = DBConfig.Address();

/**
 * 增删改用户地址
 * @param req
 * @param res
 * @param next
 */
exports.postSetAddress = (req, res, next) => {
    //add update del
    req.assert('actionType','check parameters actiontype').notEmpty().isIn(['add','update','del']);
    if (req.body.actionType == 'add'){
        req.assert('province','check parameter province').notEmpty();
        req.assert('city','check parameter city').notEmpty();
        req.assert('district', 'check parameter district').notEmpty();
        req.assert('detailAddress', 'check parameter detailAddress').notEmpty();
        req.assert('name', 'check parameter name').notEmpty().len(2,24);
        req.assert('phone', 'check parameter phone').notEmpty();
        req.assert('addressType','check parameter addressType').notEmpty();
        req.assert('isDefault', 'check parameter isDefault').notEmpty().isBoolean();
    }else if (req.body.actionType == 'del'){
        req.assert('addressID').notEmpty();
    }else if (req.body.actionType == 'update'){
        req.assert('province','check parameter province').notEmpty();
        req.assert('city','check parameter city').notEmpty();
        req.assert('district', 'check parameter district').notEmpty();
        req.assert('detailAddress', 'check parameter detailAddress').notEmpty();
        req.assert('name', 'check parameter name').notEmpty().len(2,24);
        req.assert('phone', 'check parameter phone').notEmpty();
        req.assert('addressType','check parameter addressType').notEmpty();
        req.assert('isDefault', 'check parameter isDefault').notEmpty().isBoolean();
        req.assert('addressID','check parameter addressID').notEmpty();
    }else {
        return res.json({status:ErrorTypes.ParameterError, result:{}, msg:'actionType validate error'})
    }
    let errors = req.validationErrors();
    if (errors){
        return res.json({status: ErrorTypes.ParameterError, result:{errors}, msg:'parameters validate error'})
    }

    var defaultID;
    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then((user) => {
            let userID = user.userID;
            if (req.body.actionType == 'add'){
                return Address.create({
                    user_id: userID,
                    address_type:req.body.addressType,
                    name: req.body.name,
                    phone: req.body.phone,
                    province: req.body.province,
                    city: req.body.city,
                    district: req.body.district,
                    detail: req.body.detailAddress,
                    is_default: req.body.isDefault
                })
            }else if (req.body.actionType == 'update'){
                return Address.update({
                    user_id: userID,
                    address_type:req.body.addressType,
                    name: req.body.name,
                    phone: req.body.phone,
                    province: req.body.province,
                    city: req.body.city,
                    district: req.body.district,
                    detail: req.body.detailAddress,
                    is_default: req.body.isDefault
                },{
                    where:{
                        address_id: req.body.addressID,
                        user_id: userID
                    },
                    fields:['user_id','address_type','name','phone','province','city','district','detail','is_default']
                })
            }else {
                return Address.destroy({
                    where:{
                        user_id: userID,
                        address_id: req.body.addressID
                    },
                    limit: 1,
                })
            }
        })
        .then((address) => {
            if (req.body.actionType == 'del' || req.body.isDefault == 'false'){
                return res.json({status: ErrorTypes.Success,result:{address}, msg:'success'})
            }else {
                if (req.body.actionType == 'add'){
                    defaultID = address.get('address_id');
                }else if (req.body.actionType == 'update') {
                    defaultID = req.body.addressID;
                }else {
                    throw new Error();
                }
                return Address.findAll({
                    where:{
                        user_id: req.headers.key
                    }
                });
            }
        })
        .then((addresses) => {
            var defaultAddr;
            for (var i in addresses){
                let address = addresses[i];
                if (address.get('address_id').toString() !== defaultID.toString() && address.get('is_default') == 1){
                    defaultAddr = address;
                    break
                }
            }
            if (defaultAddr !== undefined){
                return defaultAddr.update({
                    is_default:false
                },{
                    fields:['is_default']
                });
            }else {
                if (!res.finished){
                    return res.json({status:ErrorTypes.Success, result:{address:defaultAddr}, msg:'success'})
                }
            }
        })
        .then((address) => {
            if (!res.finished){
                return res.json({status:ErrorTypes.Success, result:{address}, msg:'success'})
            }
        })
        .catch((errors) => {
            if (!res.finieshed){
                res.json({status:ErrorTypes.Error, result:{errors}, msg:'error'})
            }
        })

};

/**
 * 获取用户地址列表
 * @param req
 * @param res
 * @param next
 */
exports.postFindAllAddress = (req,res,next) => {

    SwallowUtil
        .validateUser(req.headers.key,req.headers.token)
        .then((user) => {
            return Address
                .findAll({
                    where:{
                        user_id: user.userID
                    }
                })
        })
        .then((addresses) => {
            res.json({status:ErrorTypes.Success, result:{addresses}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status:ErrorTypes.Success, result:{error}, msg:'error'})
            }
        })

};
