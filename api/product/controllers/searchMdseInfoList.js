/**
 * Created by cc on 17/6/26.
 */

const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const cryptiler = require('cryptiles');

/**
 * models
 */
const MdseCategory = require('../models/mdseCategory');
const MdseInfo = require('../models/mdseinfomodel');


/**
 * Set mdse category list
 */
exports.setMdseCategorys = (req, res) => {
    const list = req.body.category_list;
    var mdseCategory = new MdseCategory();
    var index = 0;
    for (index;index < list.length; index ++){
        mdseCategory.category_list[index] = {
            name: list[index].name,
            id: cryptiler.randomString(10)
        };
    }
    mdseCategory.save((err, task) => {
        if (err){
            res.send(err);
        }else {
            res.json(task);
        }
    });
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