/**
 * Created by cc on 17/6/28.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require(global.apiPathPrefix + '/api/user/models/User');

const DBConfig = require('./DBConfig');

/**
 * 手机号码校验
 * @param phoneNumber
 * @returns {boolean}
 */
const verifyPhoneNumber = (phoneNumber) => {
    const regexp = /^0?(13[0-9]|15[012356789]|18[02356789]|14[57])[0-9]{8}$/;
    return regexp.test(phoneNumber);
};

exports.verifyPhoneNumber = verifyPhoneNumber;

/**
 * 短信验证码生成
 * @returns {string}
 */
exports.genSMSCode = () => {
    var num = "";
    var i = 0;
    for (i ;i < 6; i++) {
        num = num + Math.floor(Math.random() * 10);
    }
    return num;
};

/**
 * md5 加密
 * @param original
 */
exports.md5Encode = (original) => {
    return crypto.createHash('md5').update(original,'utf8').digest('hex');
};

/**
 * Token 生成
 * @param phone
 * @returns {String|void}
 */
exports.genToken = (phone) => {
    return jwt.sign({msg:phone}, process.env.TOKEN_SECRET, {expiresIn : '7 days'});
};

/**
 * 验证普通用户身份
 * @param phone
 * @param token
 */
exports.validateUser = (phone, token) => new Promise((resolve, reject) => {
    if (verifyPhoneNumber(phone)){
        User
            .findOne({phone:phone})
            .then((user) => {
                if (token == user.token){
                    return new Promise((resolve, reject) => {
                        jwt.verify(token,process.env.TOKEN_SECRET, (error, decode) => {
                            if (decode && decode.msg == phone){
                                resolve();
                            }else{
                                reject({error:'Token 验证错误'})
                            }
                        });
                    })
                }else {
                    reject({error:'Token 失效'});
                }
            })
            .catch((error) => {
                reject(error);
            })
    }else {
        reject({error:'token 错误'})
    }
});

/**
 * 验证商铺所有者身份
 * @param phone
 * @param token
 * @param tenantID
 */
exports.validateTenantOperator = (phone, token, tenantID) => new Promise((resolve, reject) => {
    if (verifyPhoneNumber(phone)){
         User
            .findOne({phone:phone})
            .then((user) => {
                if (token == user.token){
                    return new Promise((resolve, reject) => {
                        jwt.verify(token,process.env.TOKEN_SECRET, (error, decode) => {
                            if (decode && decode.msg == phone){
                                resolve(user);
                            }else{
                                reject({error:'Token 验证错误'})
                            }
                        });
                    });
                }else {
                    reject({error:'Token 失效'});
                }
            })
            .then((user) => {
                let Tenant = DBConfig.Tenant();
                return Tenant
                    .findOne({
                        where:{
                            ownerID:user.userID,
                            tenant_id: tenantID
                        }
                    })
                    .then((tenant) => {
                        if (tenant){
                            resolve(tenant);
                        }else {
                            reject({error: 'can not find tenant'});
                        }
                    })
                    .catch((error) => {
                        reject(error);
                    })
            })
            .catch((error) => {
                reject(error);
            })

    }else {
        reject({error:'token 错误'})
    }
});

/**
 * 验证码时效检查
 * @param smsDate
 * @returns {boolean}
 */
exports.validateSMSDate = (smsDate) => {
    if (smsDate !== undefined && (smsDate instanceof Date)){
        const fromDate = Math.floor((new Date(smsDate.toLocaleString())).getTime() / 1000 );
        const toDate = Math.floor(Date.now() / 1000);
        if (fromDate + 15 * 60 >= toDate){
            return true;
        }else {
            return false;
        }
    }else {
        return false;
    }
};



