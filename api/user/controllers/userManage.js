/**
 * Created by cc on 17/6/27.
 */

const request = require('request');
const qs = require('querystring');
const bluebird = require('bluebird');
const jwt = require('jsonwebtoken');
const crypto = bluebird.promisifyAll(require('crypto'));
const nodemailer = require('nodemailer');
const passport = require('passport');
const fileUpload = require('express-fileupload');

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const ErrorList = require(global.apiPathPrefix + '/errors/errorList');
const User = require('../models/User');

/**
 * 获取手机验证码
 */
exports.postSMSCode = (req, res, next) => {
    req.assert('phone','Phone is not valid').len(11);
    req.assert('verifyCode', 'Encode error').len(32);
    req.assert('smsType','SMS type Error').isIn(['register','login','retrieve']);

    const errors = req.validationErrors();
    if (errors) {
        res.json({status:ErrorList.ErrorType.Error, result:{errors}, msg:'校验错误'});
        return;
    }
    if ((SwallowUtil.md5Encode(req.body.phone + process.env.SMS_ENCODE) !== req.body.verifyCode) || !SwallowUtil.verifyPhoneNumber(req.body.phone)) {
        res.json(ErrorList.RegisterVerifyCodeFailed({err:'校验失败'}));
        return;
    }

    let verifyCode = SwallowUtil.genSMSCode();

    var smsText;
    switch (req.body.smsType){
        case "register":
            smsText = '【齐天大圣】您的注册验证码是' + verifyCode + '。';
            break;
        case "login":
            smsText = "【齐天大圣】您的登录验证码是" + verifyCode + '。如非本人操作请忽略';
            break;
        case "retrieve":
            smsText = "【齐天大圣】您正在找回密码，验证码是" + verifyCode + '。';
            break;
        default:
            next();
    }
    console.log("verify code - - %s",verifyCode);
    const options = {
        url: 'https://sms.yunpian.com/v2/sms/single_send.json',
        method: 'POST',
        header:{
            'Accept':'application/json;charset=utf-8',
            'Content-Type':'application/x-www-form-urlencoded;charset=utf-8',
        },
        body:qs.stringify({
            'apikey':process.env.SMS_KEY,
            'mobile':req.body.phone,
            'text': smsText
        })
    };

    User.count({}, (err, count) => {
        if (err) {
            res.json({status:ErrorList.ErrorType.DBError, result:{}, msg:'数据库查询错误'});
            return;
        }
        User
            .findOne({ phone: req.body.phone },(err,user) => {
                if (err){
                    res.json({status: ErrorList.ErrorType.DBError, resule:{err}, msg:'DB error'});
                }else if (user){
                    var isFind = false;
                    var item = 0;
                    for (item; item < user.verifyCode.length; item++){
                        const tempItem = user.verifyCode[item];
                        console.log("%s - - %s",tempItem.codeType,req.body.smsType);
                        if (tempItem.codeType == req.body.smsType){
                            tempItem.code = verifyCode;
                            tempItem.createDate = new Date();
                            isFind = true;
                        }
                    }
                    if (!isFind) {
                        user.verifyCode.push({
                            code: verifyCode,
                            codeType: req.body.smsType
                        });
                    }
                    user
                        .save((err) => {
                            if (err) {
                                res.json({ status: 0, result:{err}, msg:'User save error' });
                                return;
                            }
                            request(options,(err,request,body) => {
                                if (err) {
                                    res.json(ErrorList.RegisterVerifyCodeFailed(err));
                                }else if (request.statusCode == 200){
                                    res.json(ErrorList.RegisterVerifyCodeSuccess({err:'NO Error'}));
                                }else {
                                    res.json(ErrorList.RegisterVerifyCodeSuccess(body));
                                }
                            });
                        });
                }else {
                    const newUser = new User({
                        phone: req.body.phone,
                        verifyCode: [
                            {
                                code: verifyCode,
                                codeType: req.body.smsType
                            }
                        ],
                        userID:count + 1
                    });
                    newUser
                        .save((err) => {
                            if (err) {
                                res.json({ status: 0, result:{err}, msg:'User save error' });
                                return;
                            }
                            request(options,(err,request,body) => {
                                if (err) {
                                    res.json(ErrorList.RegisterVerifyCodeFailed(err));
                                }else if (request.statusCode == 200){
                                    res.json(ErrorList.RegisterVerifyCodeSuccess(body));
                                }else {
                                    res.json(ErrorList.RegisterVerifyCodeSuccess(body));
                                }
                            });
                        });
                }
            });
    });

};

/**
 * 注册新用户 (手机号)
 * @param req
 * @param res
 * @param next
 */
exports.postPhoneSignup = (req, res, next) => {
    req.assert('phone', 'check parameter phone').notEmpty();
    req.assert('verifyCode','Verify code is error').len(32);
    req.assert('code','SMS code is 6 length').len(6);
    req.assert('password','password is error').len(32);

    const errors = req.validationErrors();

    if (errors) {
        res.json({ status:ErrorList.ErrorType.Error, result:{errors}, msg:''});
        return;
    }

    if ((SwallowUtil.md5Encode(req.body.phone + process.env.SMS_ENCODE) !== req.body.verifyCode) || !SwallowUtil.verifyPhoneNumber(req.body.phone)) {
        res.json(ErrorList.RegisterVerifyCodeFailed({err:'校验失败'}));
        return;
    }


    User
        .findOne({phone:req.body.phone},(err,user) => {
            if (err || !user){
                res.json({status:ErrorList.ErrorType.DBError, result:{err}, msg:'查无此人'});
                return;
            }
            var codeList = user.verifyCode;
            var createDate;
            var smsCode;
            var index = 0;
            for (index;index < codeList.length; index ++) {
                let tempObj = codeList[index];
                if (tempObj.codeType == "register") {
                    createDate = tempObj.createDate;
                    smsCode = tempObj.code;
                    break;
                }
            }
            if (createDate === undefined || smsCode === undefined ) {
                res.json({status: ErrorList.ErrorType.Error,result: {},msg: '验证码类型错误'});
                return
            }
            //十五分钟内有效
            if (smsCode !== req.body.code) {
                res.json({status: ErrorList.ErrorType.Error, result:{}, msg:'验证码有误'});
                return;
            }

            if (!SwallowUtil.validateSMSDate(createDate)) {
                res.json({status: ErrorList.ErrorType.Error, result:{}, msg:'验证码超时'});
                return;
            }

            let token = SwallowUtil.genToken(req.body.phone);
            let userID = user.userID;
            codeList.splice(index,1);
            user.verifyCode = codeList;
            user.token = token;
            user.password = req.body.password;
            user
                .save((err) => {
                    if (err) {
                        res.json({status:ErrorList.ErrorType.DBError,result:{err}, msg:''});
                        return
                    }
                    res.json({status: ErrorList.ErrorType.Success, result:{token:token,key:userID}, msg:'注册成功'});
                });
        });

};

/**
 * 用户重设密码
 * @param req
 * @param res
 */
exports.postResetPwd = (req, res, next) => {

    req.assert('password', 'parameter password validate error').len(32);
    req.assert('oldPassword', 'parameter oldPassword validate errror').len(32);

    let error = req.validationErrors();
    if (error){
        return res.json({status:ErrorList.ErrorType.ParameterError, result:{error}, msg:'parameters validate error'})
    }


    SwallowUtil
        .validateUser(req.headers.key, req.headers.token)
        .then((user) => {
            return new Promise((resolve, reject) => {
                if (user.password !== undefined){
                    user.comparePassword(req.body.oldPassword,(error, isMatch) => {
                        if (isMatch){
                            resolve(user);
                        }else {
                            reject(error);
                        }
                    })
                }else {
                    resolve(user);
                }
            });
        })
        .then((user) => {
            user.password = req.body.password;
            return user
                .save()
        })
        .then((user) => {
            if (!res.finished) {
                res.json({status: 1, result:{user}, msg:'重设密码成功'});
            }
        })
        .catch((err) => {
            if (!res.finished){
                res.json({status:ErrorList.ErrorType.Error, result:{err}, msg:'密码错误'});
            }
        })
};

/**
 * 用户登录 (Phone & Password)
 * @param req
 * @param res
 */
exports.postPhoneLogin = (req, res, next) => {
    req.assert('password','check parameter password').notEmpty().len(32);
    req.assert('phone','check parameter phone').len(11);
    let errors = req.validationErrors();
    if (errors){
        return res.json({status:ErrorList.ErrorType.ParameterError, result:{errors}, msg:'parameters validate error'})
    }

    User
        .findOne({
            phone:req.body.phone
        })
        .then((user) => {
            return new Promise((resolve, reject) => {
                user.comparePassword(req.body.password,(error, isMatch) => {
                    if (isMatch){
                        resolve(user);
                    }else {
                        reject(error);
                    }
                })
            });
        })
        .then((user) => {
            user.token = SwallowUtil.genToken(user.phone);
            return user
                .save()
        })
        .then((user) => {
            res.json({status:ErrorList.ErrorType.Success, result:{user}, msg:'success'})
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status:ErrorList.ErrorType.Error, result:{error}, msg:'error'})
            }
        })
};

/**
 * 用户短信登录
 * @param req
 * @param res
 * @param next
 */
exports.postSMSCodeLogin = (req, res, next) => {
    req.assert('phone','Phone error').len(11);
    req.assert('verifyCode','Verify code error').len(32);
    req.assert('code','SMS code error').len(6);

    const errors = req.validationErrors();
    if (errors){
        res.json(ErrorList.RegisterVerifyCodeFailed(errors));
        return;
    }

    if (!SwallowUtil.verifyPhoneNumber(req.body.phone) || (SwallowUtil.md5Encode(req.body.phone + process.env.SMS_ENCODE) !== req.body.verifyCode)) {
        res.json({status:ErrorList.ErrorType.Error, result:{}, msg:'手机号码有误'});
        return;
    }

    User
        .findOne({phone:req.body.phone})
        .then((user) => new Promise((resolve, reject) => {
            var codeList = user.verifyCode;
            var createDate;
            var smsCode;
            var index = 0;
            for (index;index < codeList.length; index++) {
                let tempObj = codeList[index];
                if (tempObj.codeType == "login") {
                    createDate = tempObj.createDate;
                    smsCode = tempObj.code;
                    break;
                }
            }
            let tempDate = SwallowUtil.validateSMSDate(createDate);
            if (createDate === undefined || smsCode === undefined || !tempDate || req.body.code !== smsCode) {
                reject({error:"验证码有误"});
            }else {
                codeList.splice(index,1);
                user.verifyCode = codeList;
                resolve(user);
            }
        }))
        .then((user) => {
            let token = SwallowUtil.genToken(user.phone);
            user.token = token;
            return user.save().then((user) => new Promise((resolve, reject) => {
                if (!user) {
                    reject();
                }else {
                    resolve(user);
                }
            }))
        })
        .then((user) => {
            if (!user){
                res.json({status:ErrorList.ErrorType.Error,result: {}, msg:'用户数据保存失败'})
            }else {
                res.json({status:ErrorList.ErrorType.Success,result: {token:user.token,key:user.userID}, msg:'用户登录成功'})
            }
        })
        .catch((err) => {
            if (!res.finished){
                res.json({status:ErrorList.ErrorType.Error, result:{err}, msg:'短信登录失败'});
            }
        })

};

/**
 * 获取用户列表 page 从 1 开始
 */
exports.postUserList = (req, res, next) => {

    req.assert('itemsPerPage','Parameter itemsPerPage validate error').isInt();
    req.assert('page','Parameter page validate error').isInt();

    let error = req.validationErrors();
    if (error) {
        return res.json({status:0, result:{}, msg:'Parameter validate error'})
    }

    let itemsPerPage = parseInt(req.body.itemsPerPage);
    let page = parseInt(req.body.page);

    var skipNum = itemsPerPage * page;
    skipNum = skipNum > 0 ? skipNum : 0;

    SwallowUtil
      .validateUser(req.headers.key, req.headers.token)
      .then((user) => Promise((resolve,reject) => {
          if (user.priority == 1000) {
              resolve()
          }else {
              reject({error:"权限不够,无法访问"})
          }
      }))
      .then(() => {
          return User.find({})
            .skip(skipNum)
            .limit(page)
            .exec()
      })
      .then((users) => {
          res.json({users});
      })
      .catch((error) => {
          if (!res.finished) {
              res.json({status: ErrorList.ErrorType.Error, result:{error}, msg:'获取用户列表失败'})
          }
      })

};

/**
 * 更新用户信息
 * @param req
 * @param res
 * @param next
 */
exports.postUpdateProfile = (req, res, next) => {
    req.assert('phone', 'Please enter a valid email address.').len(11);

    const errors = req.validationErrors();

    if (errors || !SwallowUtil.verifyPhoneNumber(req.body.phone)){
        res.json({status: 0, result:{}, msg:'Validation failed'});
        return;
    }

    User.findOne({phone:req.body.phone})
        .then((user) => new Promise((resolve, reject) => {
            if (!user){
                reject({error:"查无此人"});
            }else{
                resolve(user);
            }
        }))
        .then((user) => {
            return new Promise((resolve, reject) => {
                jwt.verify(req.headers.token, process.env.TOKEN_SECRET, (err,decode) => {
                    if (decode && req.headers.token === user.token && decode.msg === req.body.phone) {
                        resolve(user);
                    }else {
                        reject(err);
                    }
                });
            });
        })
        .then((user) => {
            user.profile.name = req.body.name || user.profile.name;
            user.profile.gender = req.body.gender || user.profile.gender;
            user.profile.location = req.body.location || user.profile.location;
            user.profile.website = req.body.websize || user.profile.website;
            return new Promise((resolve, reject) => {
                user
                    .save()
                    .then((user) => {
                        if (user){
                            resolve(user)
                        }else{
                            reject()
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    })
            })
        })
        .then(() => {
            if (!res.finished){
                res.json({status:ErrorList.ErrorType.Success, result:{}, msg:'更改用户信息成功'});
            }
        })
        .catch((err) => {
            console.log("some error - - ");
            if (!res.finished){
                res.json({status:ErrorList.ErrorType.Error, result: {err}, msg:'更改有误'});
            }
        })

};

/**
 * 用户上传头像
 * @param req
 * @param res
 * @param next
 */

exports.postUploadImg = (req, res, next) => {

    if (!req.files){
        return res.json({status:ErrorList.ErrorType.Error, result:{}, msg:'没有检测到文件'});
    }

    const verifyPhone = (phone) => new Promise((resolve, reject) => {
        if (!SwallowUtil.verifyPhoneNumber(phone)){
            reject({error:'手机号码错误'});
        }else {
            resolve();
        }
    });

    verifyPhone(req.headers.phone)
        .then(() => new Promise((resolve, reject) => {
            jwt.verify(req.headers.token, process.env.TOKEN_SECRET, (error) => {
                if (error){
                    reject(error);
                }else {
                    resolve()
                }
            })
        }))
        .then(() => new Promise((resolve, reject) => {
            User
                .findOne({phone:req.headers.phone})
                .then((user) => {
                    resolve(user);
                })
                .catch((error) => {
                    reject(error);
                })
        }))
        .then((user) => new Promise((resolve,reject) => {
            let sampleFiles = req.files.headImage;
            let imgName = SwallowUtil.md5Encode(req.headers.phone) + ".jpg";
            user.profile.picture = imgName;
            sampleFiles.mv(global.apiPathPrefix + `/uploads/headImages/${imgName}`, (error) => {
                if (error){
                    reject(error);
                }else {
                    resolve(user);
                }
            });
        }))
        .then((user) => new Promise((resolve, reject) => {
            user
                .save((err) => {
                    if (err){
                        reject(err);
                    }else{
                        resolve({imgName:user.profile.picture})
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        }))
        .then((img) => {
            if (!res.finished){
                res.json({status: ErrorList.ErrorType.Success, result:{imgName:img.imgName}, msg:'图片保存成功'});
            }
        })
        .catch((error) => {
            if (!res.finished){
                res.json({status: ErrorList.ErrorType.Error, result:{error}, msg:'上传失败'})
            }
        });

};


