/**
 * Created by cc on 17/7/13.
 */

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorType = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const Bluebird = require('bluebird');


exports.postCreateSPU = (req, res, next) => {

    req.assert('categoryID','parameter categoryID can not be empty').notEmpty();
    req.assert('brandID','parameter brandID can not be empty').notEmpty();
    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorType.ParameterError, result:{error}, msg:'parameter validate error'});
    }

    SwallowUtil
        .validateUser(req.headers.phone, req.headers.token)
        .then()
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorType.Error, result:{error}, msg:'error'});
            }
        })

};
