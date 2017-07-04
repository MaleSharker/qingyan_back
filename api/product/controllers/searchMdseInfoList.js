/**
 * Created by cc on 17/6/26.
 */

const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const cryptiler = require('cryptiles');
const ErrorList = require(global.apiPathPrefix + '/errors/errorList');

/**
 * models
 */
const MdseCategory = require('../models/mdseCategory');
const MdseInfo = require('../models/mdseinfomodel');


/**
 * Set mdse category list
 */
exports.postMdseCategorys = (req, res, next) => {

    let dbFind = () => new Promise((resolve, reject) => {
        MdseCategory
            .find()
            .exec((error, docs) => {
                if (error) {
                    reject({error:error});
                }else {
                    resolve(docs);
                }
            })
            .catch((error) => {
                reject({error:error});
            })
    });
    dbFind()
        .then((docs) => {
            const category = new MdseCategory(req.body.category);
            return new Promise((resolve, reject) => {
                category
                    .save()
                    .then((category) => {
                        if (category){
                            resolve()
                        }else {
                            reject();
                        }
                    })
                    .catch((error) => {
                        reject({error:error});
                    })
            })

        })
        .then(() => {
            if (!res.finished){
                res.json({status: ErrorList.ErrorType.Success, result:{}, msg:''});
            }
        })
        .catch((err) => {
            next(err)
        })
};

/**
 * Get mdse category list
 */

/**
 * Get MdseInfoList
 */
exports.searchMdseList = (req, res) => {
    MdseInfo.find({},function (err,task) {
        if (err){
            res.send(err);
        }
        res.json(task);
    });
};

exports.createMdseItem = (req, res) => {
    var newMdse = new MdseInfo();
    newMdse.save(function (err, task) {
        if (err){
            res.send(err);
        }
        res.json(task);
    });
};