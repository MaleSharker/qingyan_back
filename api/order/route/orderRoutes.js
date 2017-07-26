/**
 * Created by cc on 17/7/25.
 */


module.exports = (app) => {

    let orderController = require('../controller/orderController');

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
     * 管理员修改订单商品价格
     */
    app.route('/mgmt/v1/order/updateOrderPrice')
        .post(orderController.postUpdateOrderPrice);

};


