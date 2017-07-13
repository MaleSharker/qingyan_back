/**
 * Created by cc on 17/7/13.
 */



const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorType = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const Bluebird = require('bluebird');


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

