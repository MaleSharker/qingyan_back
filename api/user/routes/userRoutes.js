/**
 * Created by cc on 17/6/27.
 */

const path = require('path');

module.exports = function (app) {
    const userManage = require('../controllers/userManage');

    // const passportConfig = require(global.apiPathPrefix + '/config/passport');

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
     * 用户登录 (phone & password)
     */
    app.route('/client/v1/user/phoneLogin')
        .post(userManage.postPhoneLogin);

    /**
     * 用户验证码登录 (Phone && SMS)
     */
    app.route('/client/v1/user/smsCodeLogin')
        .post(userManage.postSMSCodeLogin);

    /**
     * 获取用户列表
     */
    app.route('/mgmt/v1/user/userList')
      .post(userManage.postUserList);

    /**
     * 更改用户信息
     */
    app.route('/client/v1/user/updateProfile')
        .post(userManage.postUpdateProfile);

    /**
     * 上传头像
     */
    app.route('/client/v1/user/uploadHeadImg')
        .post(userManage.postUploadImg);

};