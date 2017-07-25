/**
 * Created by cc on 17/7/25.
 */


module.exports = (app) => {

    let ShopCart = require('../controllers/shopCartController');

    app.route('/client/v1/user/setShopCart')
        .post(ShopCart.setShoppingCart);

    app.route('/client/v1/user/shopCartList')
        .post(ShopCart.postShopCartList);

};

