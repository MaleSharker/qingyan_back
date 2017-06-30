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

const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const ErrorList = require(global.apiPathPrefix + '/errors/errorList');
const User = require('../models/User');

/**
 * 获取手机验证码
 */
exports.postSMSCode = (req, res, next) => {
    req.assert('phone','Phone is not valid').len(11);
    req.assert('verifyCode', 'Encode error').len(32);

    const errors = req.validationErrors();
    if (errors) {
        res.json(ErrorList.RegisterVerifyCodeFailed(errors));
        return;
    }

    if ((SwallowUtil.md5Encode(req.body.phone + process.env.SMS_ENCODE) !== req.body.verifyCode) || !SwallowUtil.verifyPhoneNumber(req.body.phone)) {
        res.json(ErrorList.RegisterVerifyCodeFailed({err:'校验失败'}));
        return;
    }

    let verifyCode = SwallowUtil.genSMSCode();
    console.log('verify code - %s', verifyCode);
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
            'text': '【齐天大圣】您的验证码是' + verifyCode
        })
    };

    const newUser = new User({
        phone: req.body.phone,
        verifyCode: [
            {
                code: verifyCode,
                codeType: 'register'
            }
        ]
    });
    User
        .findOne({ phone: req.body.phone },(err,user) => {
            if (err){
                res.json({status: ErrorList.ErrorType.DBError, resule:{err}, msg:'DB error'});
            }else if (user){
                user.verifyCode = [
                    {
                        code: verifyCode,
                        codeType: 'register'
                    }
                ];
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
                                res.json(ErrorList.RegisterVerifyCodeSuccess(body));
                            }else {
                                res.json(ErrorList.RegisterVerifyCodeSuccess(body));
                            }
                        });
                    });
            }else {
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
};

/**
 * 注册新用户 (手机号)
 * @param req
 * @param res
 * @param next
 */
exports.postPhoneSignup = (req, res, next) => {
    req.assert('verifyCode','Verify code is error').len(32);
    req.assert('code','SMS code is 6 length').len(6);

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
            console.log('create date %s, sms code %s',createDate,smsCode);
            if (createDate === undefined || smsCode === undefined ) {
                res.json({status: ErrorList.ErrorType.Error,result: {},msg: '验证码类型错误'});
                return
            }
            //十五分钟内有效
            if (smsCode !== req.body.code) {
                res.json({status: ErrorList.ErrorType.Error, result:{}, msg:'验证码有误'});
                return;
            }

            if (createDate.getTime() + 1000 * 60 * 15 < Date.now()) {
                res.json({status: ErrorList.ErrorType.Error, result:{}, msg:'验证码超时'});
                return;
            }

            codeList.splice(index,1);
            user.verifyCode = codeList;
            user
                .save((err) => {
                    if (err) {
                        res.json({status:ErrorList.ErrorType.DBError,result:{err}, msg:''});
                        return
                    }
                    let token = jwt.sign({msg:req.body.phone}, process.env.TOKEN_SECRET, {expiresIn : '7 days'});
                    res.json({status: ErrorList.ErrorType.Success, result:{token:token}, msg:'注册成功'});
                });
        });

};

/**
 * 用户重设密码
 * @param req
 * @param res
 */
exports.postResetPwd = (req, res, next) => {

    const verifyPhone = () => new Promise((resolve, reject) => {
        if (!SwallowUtil.verifyPhoneNumber(req.body.phone)) {
            reject({err:'手机号码格式错误'});
        }else {
            resolve();
        }
    });

    const verifyToken = () => {
        return new Promise((resolve, reject) => {
            jwt.verify(req.body.token, process.env.TOKEN_SECRET, (err, decode) => {
                if (err) {
                    reject({err:err});
                }else {
                    if (decode.msg !== req.body.phone) {
                        reject({err:'token 格式错误,不匹配'});
                    }else {
                        resolve();
                    }
                }
            });
        });
    };

    const resetPwd = () => {
        User
            .findOne({phone:req.body.phone})
            .then((user) => {
                if (!user){
                    res.json({status: ErrorList.ErrorType.DBError, result:{err}, msg:"查无此人"});
                }
                jwt.verify(req.body.token, process.env.TOKEN_SECRET, (err, decode) => {
                    if (decode.msg == req.body.phone && req.body.token == user.token) {
                        user.password = req.body.password;
                        return user.save().then((user) => new Promise((resolve, reject) => {
                            if (!user){
                                reject(err);
                            }else {
                                resolve();
                            }
                        }));
                    }
                    reject({err:'token 失效,请重新登录'});
                });

            })
            .catch((err) => next(err))
    };
    verifyPhone()
        .then(verifyToken)
        .then(resetPwd)
        .then(() => {
            if (!res.finished) {
                res.json({status: 1, result:{}, msg:'重设密码成功'});
            }
        })
        .catch((err) => {
            next(err);
        })
};

/**
 * 用户登录 (Phone)
 * @param req
 * @param res
 */
exports.postPhoneLogin = (req, res, next) => {
    if (!SwallowUtil.verifyPhoneNumber(req.body.phone)){
        res.json({status: ErrorList.ErrorType.Error,result:{}, msg:'手机号码有误' });
        return
    }

    const findUser = () => new Promise ((resolve, reject) => {
        return User
            .findOne({phone: req.body.phone})
            .then((user) => {
                user.comparePassword(req.body.password, (error, isMatch) => {
                    if (!isMatch){
                        reject(error);
                    }
                    resolve(user);
                })
            });
    });

    const saveUser = (user) => {
        const token = SwallowUtil.genToken(user.phone);
        user.token = token;
        return user
            .save()
            .then((user) => new Promise((resolve, reject) => {
                if (!user){
                    reject();
                }
                resolve({token: user.token});
            }))

    };
    findUser()
        .then(saveUser)
        .then((obj) => {
            if (obj !== undefined) {
                res.json({status:ErrorList.ErrorType.Success, result:{obj}, msg:'登录成功'});
            }else {
                res.json({status:ErrorList.ErrorType.Error, result:{obj}, msg:"登录失败"})
            }
        })
        .catch((err) => next())
};

/**
 * Create a new local account (email)
 */
exports.postEmailSignup = (req, res, next) => {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors){
        res.json({status: 0, result: {errors}, msg:'validationErrors'});
        return
    }
    const user = new User({
        email: req.body.email,
        password: req.body.password
    });

    User.findOne({ email: req.body.email }, (err, existingUser) => {
        if (err){ return next(err); }
        if (existingUser){
            res.json({status: 0, result:{}, msg:'用户已经存在'});
            return
        }
        user.save((err) => {
            if (err) { return next(err); }
            req.login(user, (err) => {
                if (err) { res.json({status: 0, result: {err}, msg:'Create user failed.'}); }
                res.json({status: 1,result:{},msg:'创建新用户成功'});
            })
        });
    });
};

/**
 * Sign in using email and password
 */
exports.postEmailLogin = (req, res, next) => {
    req.assert('email', 'Email is not avlid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors){
        res.json({status: 0, result:[],msg:'Body valid failed!'});
    }

    passport.authenticate('local', (err, user, info) => {
        if (err){ return next(err) }
        if (!user){
            res.json({status: 0, result:{}, msg:'用户不能为空'});
        }
        req.logIn(user, (err) => {
            if (err){ return next(err); }
            res.json({status: 1, result:{}, msg:"登录成功"});
        });
    })(req, res, next);

};

/**
 * Log out
 */
exports.logout = (req, res) => {
    req.logout();
    res.json({status: 1,result:{}, msg:"登出成功"});
};

exports.postUpdateProfile = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false });

    const errors = req.validationErrors();

    if (errors){
        res.json({status: 0, result:{}, msg:'Validation failed'});
    }

    User.findById(req.user.id, (err, user) => {
        if (err){ return next(err); }
        user.email = req.body.email || '';
        user.profile.name = req.body.name || '';
        user.profile.gender = req.body.gender || '';
        user.profile.location = req.body.location || '';
        user.profile.website = req.body.websize || '';
        user.save((err) => {
            if (err){
                if (err.code === 11000){
                    res.json({status: err.code, result:{}, msg:'The email address you have entered is already associated with an account.'});
                }
                return next(err);
            }
            res.json({status: 1, result:{}, msg:'Update profile success.'});
        });
    });

};


/**
 * Update current password.
 */
exports.postUpdatePassword = (req, res, next) => {
    req.assert('password','Please must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors){
        res.json({status: 0, result:{}, msg:'Validate failed!'});
    }

    User.findById(req.user.id, (err, user) => {
        if (err){
            return next(err);
        }
        user.password = req.body.password;
        user.save((err) => {
            if (err){
                return next(err);
            }
            res.json({status: 1, result:{}, msg:'Save success'});
        });
    });

};

/**
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
    if (req.isAuthenticated){
        return res.redirect('/');
    }
    User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
            if (err){
                return next(err);
            }
            if (!user){
                return res.redirect('/forgot');
            }
            res.json({status: 1,result:{}, msg:''});
        });
};


/**
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    const errors = req.validationErrors();

    if (errors){
        res.json({status: 0, result:{}, msg:'Validate failed'})
    }

    const resetPassword = () =>
        User
            .findOne({ passwordResetToken: req.params.token})
            .where('passwordResetExpires').gt(Date.now())
            .then((user) => {
                if (!user){
                    res.json({status: 0, result:{}, msg:'Not find user'});
                }
                user.password = req.body.password;
                user.passwordResetToken = undefined;
                user.passwordResetExpires = undefined;
                return user.save().then(() => new Promise((resolve, reject) => {
                    req.login(user, (err) => {
                        if (err){ return reject(err); }
                        resolve(user);
                    });
                }));

            });

    const sendResetPasswordEmail = (user) => {
        if (!user){ return;}
        const transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD
            }
        });

        const mailOptions = {
            to: user.email,
            frame: 'hackathon@starter.com',
            subject: 'Your Hackathon Starter password has been changed',
            text: `Hello, \n\nThis is a confirmation that the password for your account ${user.email}`
        };
        return transporter.sendMail(mailOptions)
            .then(() => {
                req.flash('success',{ msg: 'Success! Your password has been changed.'});
            });
    };

    resetPassword()
        .then(sendResetPasswordEmail)
        .then(() => {
            if (!res.finished) {
                res.json({status: 1, result:{}, msg:'success'});
            }
        })
        .catch(err => next(err));

};

/**
 * Forget Password page.
 */
exports.getForgot = (req, res) => {
    if (req.isAuthenticated){
        return res.redirect('/');
    }
    res.json({status: 1,result:{},msg:'get forgot'});
};

/**
 *  Create a random token, then send user an email with a reset link
 */
exports.postForgot = (req, res, next) => {
    req.assert('email', 'Please enter a valid email address.').isEmail();
    req.sanitize('email').normalizeEmail({ remove_dots: false});

    const errors = req.validationErrors();

    if (errors){
        res.json(errors)
    }

    const createRandomToken =
        crypto
            .randomBytesAsync(16)
            .then(buf => {
                buf.toString('hex');
                console.log('Random token - - %s',buf);
            });

    const setRandomToken = token =>
        User
            .findOne({ email: req.body.email})
            .then((user) => {
                if (!user){
                    req.json({status: 0, result:{}, msg:'Can not find user'});
                }else {
                    user.passwordResetToken = token;
                    user.passwordResetExpires = Date.now() + 3600000; //1 hour
                    user = user.save()
                }
                return user;
            });

    const sendForgotPasswordEmail = (user) => {
        if (!user){ return; }
        const token = user.passwordResetToken;
        const transporter = nodemailer.createTransport({
            service: 'SendGrid',
            auth: {
                user: process.env.SENDGRID_USER,
                pass: process.env.SENDGRID_PASSWORD
            }
        });
        const mailOptions = {
            to: user.email,
            from: 'hackathon@starter.com',
            subject: 'Reset your password on Qingyan Culture',
            text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
        Please click on the following link, or paste this into your browser to complete the process:\n\n
        http://${req.headers.host}/reset/${token}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        return transporter.sendMail(mailOptions)
            .then(() => {
                res.json({status: 1, result:{}, msg:'Send reset email success'});
            });
    };

    createRandomToken
        .then(setRandomToken)
        .then(sendForgotPasswordEmail)
        .then(() => res.json({status: 1, result:{}, msg:''}))
        .catch(next)

};




