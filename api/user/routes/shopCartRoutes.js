/**
 * Created by cc on 17/7/25.
 */


module.exports = (app) => {

    let ShopCart = require('../controllers/shopCartController');

    //添加购物车
    app.route('/client/v1/user/setShopCart')
        .post(ShopCart.setShoppingCart);
    //获取购物车列表
    app.route('/client/v1/user/shopCartList')
        .post(ShopCart.postShopCartList);

};

