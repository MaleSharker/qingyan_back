/**
 * Created by baichenchen on 2017/7/23.
 */


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shopCart = new Schema({

},{
    timeStamps:true
});

const ShoppingCart = mongoose.model('shoppingcart',shopCart);

module.exports = ShoppingCart;
