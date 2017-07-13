/**
 * Created by cc on 17/7/12.
 */

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const ErrorList = require(global.apiPathPrefix + '/errors/errorList');
const Bluebird = require('bluebird');
const Sequelize = require('sequelize');


/**
 * 用户添加类别
 * @param req
 * @param res
 * @param next
 */
exports.postAddCategory = (req, res, next) => {

    const Category = DBConfig.Category();

    SwallowUtil.validateUser(req.headers.phone, req.headers.token)
        .then(() => new Promise((resolve, reject) => {
            Category
                .findOrCreate({where: { name:req.body.name}})
                .spread((category, created) => {
                    if (category) {
                        resolve(category, created);
                    }else {
                        reject();
                    }
                })
        }))
        .then((category, created) => {
            console.log(category);
            if (category) {
                return res.json({status:ErrorList.ErrorType.Success, result:{
                    categoryID: category.get('category_id'),
                    name: category.get('name')
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



