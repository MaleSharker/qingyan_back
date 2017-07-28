/**
 * Created by YCYL on 2017/7/28.
 */

module.exports = (app) => {

    let controller = require('../controllers/couponController');

    app.route('/client/v1/user/drawCoupon') //用户领取优惠券
        .post(controller.postDrawCoupon);
};

