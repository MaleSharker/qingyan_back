/**
 * Created by cc on 17/7/25.
 */


module.exports = (app) => {

    let orderController = require('../controller/orderController');
    let paymentController = require('../controller/paymentController');

    /**
     * 创建订单
     */
    app.route('/client/v1/order/createOrder')
        .post(orderController.postCreateOrder);

    /**
     * 用户修改订单商品数量
     */
    app.route('/client/v1/order/updateOrderCount')
        .post(orderController.postUpdateOrderCount);

    /**
     * 用户获取订单列表
     */
    app.route('/client/v1/order/findOrderList')
        .post(orderController.postUserFindOrderList);

    /**
     * 用户支付订单
     */
    app.route('/client/v1/order/payOrder')
        .post(paymentController.postPayOrder);

    /**
     * 用户申请退款
     */
    app.route('/client/v1/order/applyRefund')
        .post(paymentController.postApplyRefundOrder);

    /* - - - - 商家管理订单 - - - - */
    /**
     * 管理员修改订单商品价格
     */
    app.route('/mgmt/v1/order/updateOrderPrice')
        .post(orderController.postTenantUpdateOrderPrice);

    /**
     * 管理员修改订单物流费用
     */
    app.route('/mgmt/v1/order/tenantUpdateOrderLogistic')
        .post(orderController.postTenantUpdateOrderLogistic);

    /**
     * 商铺获取订单列表
     */
    app.route('/mgmt/v1/order/findOrderList')
        .post(orderController.postTenantFindOrderList);

    /**
     * 商家同意退款
     */
    app.route('/mgmt/v1/order/permitOrderRefund')
        .post(paymentController.postTenantRefundOrder);

};


