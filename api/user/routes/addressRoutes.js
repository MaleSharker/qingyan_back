/**
 * Created by baichenchen on 2017/7/24.
 */

module.exports = (app) => {

    let AddressCtr = require('../controllers/addressController');

    /**
     * 增删改用户地址列表
     */
    app.route('/client/v1/user/setAddress')
        .post(AddressCtr.postSetAddress);

    /**
     * 查找所有地址
     */
    app.route('/client/v1/user/findAllAddress')
        .post(AddressCtr.postFindAllAddress);

};
