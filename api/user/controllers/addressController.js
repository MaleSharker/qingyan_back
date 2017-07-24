/**
 * Created by cc on 17/7/24.
 */

const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const Bluebird = require('bluebird');

let Address = DBConfig.Address();

exports.addAddress = (req, res, next) => {
    //add update del
    req.assert('actionType','check parameters actiontype').notEmpty().matches(['add','update','del']);
    if (req.body.actionType == 'add' || req.body.actionType == 'update'){
        req.assert('province','check parameter province').notEmpty();
        req.assert('city','check parameter city').notEmpty();
        req.assert('district', 'check parameter district').notEmpty();
        req.assert('detailAddress', 'check parameter detailAddress').notEmpty();
        req.assert('name', 'check parameter name').notEmpty().len(2,24);
        req.assert('phone', 'check parameter phone').notEmpty().isMobilePhone();
        req.assert('addressType','check parameter addressType').notEmpty();
        req.assert('isDefault', 'check parameter isDefault').notEmpty().isBoolean();
    }else if (req.body.actionType == 'del'){
        req.assert('addressID').notEmpty();
    }else {
        return res.json({status:ErrorTypes.ParameterError, result:{}, msg:'actionType validate error'})
    }
    let errors = req.validationErrors();
    if (errors){
        return res.json({status: ErrorTypes.ParameterError, result:{}, msg:'parameters validate error'})
    }

    var defaultID;
    SwallowUtil
        .validateUser(req.headers.phone,req.headers.token)
        .then((user) => {
            let userID = user.user_id;
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
                return res.json({status: ErrorTypes.Success,result:{address}, msg:'delete success'})
            }else {
                defaultID = address.get('address_id');
                return Address.findAll({
                    where:{
                        user_id: address.get('user_id')
                    }
                });
            }
        })
        .then((addresses) => {
            var defaultAddr;
            for (var i in addresses){
                let address = addresses[i];
                if (address.get('address_id') !== defaultID && address.get('is_default') == 'true'){
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
                    return res.json({status:ErrorTypes.Success, result:{}, msg:'success'})
                }
            }
        })
        .then((address) => {
            if (!res.finished){
                return res.json({})
            }
        })
        .catch((errors) => {
            if (!res.finieshed){
                res.json({status:ErrorTypes.Error, result:{errors}, msg:'error'})
            }
        })

};

