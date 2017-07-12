/**
 * Created by cc on 17/7/12.
 */

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorList = require(global.apiPathPrefix + '/errors/errorList');
const Sequelize = require('sequelize');


exports.postAddCategory = (req, res, next) => {

    const Category = DBConfig.Category();

    SwallowUtil.validateUser(req.headers.phone, req.headers.token)
        .then(() => {
            return Category.findOrCreate({where: {name:req.body.name}});
        })
        .then((result) => {
            if (result) {
                return res.json({status:ErrorList.ErrorType.Success, result:{
                    categoryID:result.get('category_id'),
                    name: result.get('name')
                }, msg:'success'});
            }
            return res.json({status: ErrorList.ErrorType.DBError, result: {}, msg: 'Error'})
        })
        .catch((error) => {
            if (!res.finished) {
                res.json({status: ErrorList.ErrorType.Error, result: {error}, msg: 'error'});
            }
        })

};



