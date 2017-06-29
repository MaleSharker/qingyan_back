/**
 * Created by cc on 17/6/27.
 */

const path = require('path');

module.exports = function (app) {
    const userManage = require('../controllers/userManage');

    const passportConfig = require(global.apiPathPrefix + '/config/passport');

    /**
     * 发送验证码
     */
    app.route('/client/v1/user/SMSCode')
        .post(userManage.postSMSCode);

    /**
     * 创建用户 (Phone)
     */
    app.route('/client/v1/user/phoneSignup')
        .post(userManage.postPhoneSignup);

    /**
     * 用户设置密码 (Phone)
     */
    app.route('/client/v1/user/resetPassword')
        .post(userManage.postResetPwd);

    /**
     * 创建用户 (邮箱)
     */
    app.route('/client/v1/user/emailSignup')
        .post(userManage.postEmailSignup);

    /**
     * 用户邮箱登录
     */
    app.route('/client/v1/user/emailLogin')
        .post(userManage.postEmailLogin);

    /**
     * 用户登出
     */
    app.route('/client/v1/user/logout')
        .post(userManage.logout);

    /**
     * 忘记密码 (邮箱)
     */
    app.route('/client/v1/user/emailForgot')
        .get(userManage.getForgot)
        .post(userManage.postForgot);

    /**
     * 重设密码 (邮箱)
     */
    app.route('/client/v1/user/emailResetPwd')
        .get(userManage.getReset)
        .post(userManage.postReset);

    /**
     * 更新用户信息
     */
    app.route('/client/v1/user/updateProfile')
        .post(userManage.postUpdateProfile);

    /**
     * 更新用户密码
     */
    app.route('/client/v1/user/updatePwd')
        .post(userManage.postUpdatePassword);
};