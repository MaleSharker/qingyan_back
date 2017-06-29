/**
 * Created by cc on 17/6/28.
 */

const crypto = require('crypto');

/**
 * 手机号码校验
 * @param phoneNumber
 * @returns {boolean}
 */
exports.verifyPhoneNumber = (phoneNumber) => {
    const regexp = /^0?(13[0-9]|15[012356789]|18[02356789]|14[57])[0-9]{8}$/;
    return regexp.test(phoneNumber);
};

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