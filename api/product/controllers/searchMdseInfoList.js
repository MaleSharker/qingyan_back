/**
 * Created by cc on 17/6/26.
 */

const bluebird = require('bluebird');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const MdseInfo = require('../models/mdseinfomodel');


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