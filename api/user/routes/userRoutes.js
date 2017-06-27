/**
 * Created by cc on 17/6/27.
 */


module.exports = function (app) {
    var userManage = require('../controllers/userManage');

    /**
     * 创建用户 (邮箱)
     */


    /**
     * 用户邮箱登录
     */
    app.route('/client/v1/user/emailLogin')
        .post(userManage.postLogin);

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


};