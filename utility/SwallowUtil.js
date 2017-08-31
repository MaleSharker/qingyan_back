/**
 * Created by cc on 17/6/28.
 */

const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require(global.apiPathPrefix + '/api/user/models/User');
const Bluebird = require('bluebird');

const DBConfig = require('./DBConfig');

var readFile = Bluebird.promisify(require('fs').readFile);

/**
 * 手机号码校验
 * @param phoneNumber
 * @returns {boolean}
 */
const verifyPhoneNumber = (phoneNumber) => {
    const regexp = /^0?(13[0-9]|15[012356789]|17[0123456789]|18[02356789]|14[57])[0-9]{8}$/;
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
    const md5 = crypto.createHash('md5').update(original,'utf8').digest('hex');
    return md5;
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
exports.validateUser = (userID, token) => new Bluebird((resolve, reject) => {
    if (userID > 0){
        User
            .findOne({userID:userID})
            .then((user) => {
                if (token == user.token){
                    return new Bluebird((resolve, reject) => {
                        jwt.verify(token,process.env.TOKEN_SECRET, (error, decode) => {
                            if (decode && decode.msg == user.phone){
                                resolve(user);
                            }else{
                                reject({error:'Token 验证错误'})
                            }
                        });
                    })
                }else {
                    reject({error:'Token 失效'});
                }
            })
            .then((user) => {
                resolve(user);
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
exports.validateTenantOperator = (userID, token, tenantID) => new Bluebird((resolve, reject) => {

    if (userID > 0){
         User
            .findOne({userID})
            .then((user) => {
                if (token == user.token){
                    return new Bluebird((resolve, reject) => {
                        jwt.verify(token,process.env.TOKEN_SECRET, (error, decode) => {
                            if (decode && decode.msg == user.phone){
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
 * 验证pingpp Webhooks 签名
 * @param signature
 * @param rawData
 * @returns {Promise|Promise.<TResult>|*}
 */
exports.validatePingppSignature = (signature, rawData) => {
    let publicKeyPath = global.apiPathPrefix + '/pingpp_webhook_public_key.pem';
    return readFile(publicKeyPath,'utf8')
        .then((contents) => {
            let verifier = crypto.createVerify('RSA-SHA256').update(rawData,'utf8');
            return new Bluebird((resolve, reject) => {
                if (verifier.verify(contents,signature,'base64')){
                    resolve();
                }else {
                    reject({error:'webhooks signature validate error'});
                }
            })
        })
};

/**
 * 验证码时效检查
 * @param smsDate
 * @returns {boolean}
 */
exports.validateSMSDate = (smsDate) => {
    if (smsDate !== undefined && (smsDate instanceof Date)){
        const fromDate = Math.floor((new Date(smsDate.toLocaleString())).getTime() / 1000 );
        const toDate = Math.floor(Date.now() / 1000);
        console.log('from - - to - - ', fromDate, toDate);
        if (fromDate + 15 * 60 >= toDate){
            return true;
        }else {
            return false;
        }
    }else {
        return false;
    }
};

/**
 * 判断数组是否含有某元素
 * @param array
 * @param item
 * @returns {boolean}
 */
exports.validateContains = (array,item) => {

    for (var i in array){
        let value = array[i];
        if (value === item){
            return true;
        }
    }
    return false;
};

/**
 * 删除数组中的指定元素
 * @param array
 * @param item
 */
exports.removeByValue = (array,item) => {
    for (var i in array){
        if (array[i] === item){
            array.splice(i,1);
            break;
        }
    }
};

/**
 * 获取两个数组的交集
 * [{}],[{}]
 * return where array1.name1 == array2.name2
 * @param array1
 * @param name1
 * @param array2
 * @param name2
 */
exports.arrayIntersection = (array1, name1, array2, name2) => {
    let result = [];
    array1.map((value1) => {
        array2.map((value2) => {
            if (value1[name1] == value2[name2]){
                result.push(value1);
            }
        });
    });
    return result;

};