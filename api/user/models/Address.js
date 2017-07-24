/**
 * Created by baichenchen on 2017/7/23.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const address = new Schema({

},{
    timeStamps:true
});

const Address = mongoose.model('address',address);

module.exports = Address;