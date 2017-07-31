/**
 * Created by YCYL on 2017/7/28.
 */

module.exports = (app) => {

    let controller = require('../controllers/couponController');

    //获取商铺优惠券列表
    app.route('/client/v1/user/findTenantCoupons')
        .post(controller.postFindTenantCoupons);

    app.route('/client/v1/user/drawCoupon') //用户领取优惠券
        .post(controller.postDrawCoupon);

    //获取已经领取的商铺优惠券
    app.route('/client/v1/user/findUserCoupons')
        .post(controller.postFindUserCoupons);
};

