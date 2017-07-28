/**
 * Created by cc on 17/7/27.
 */

const ErrorTypes = require(global.apiPathPrefix + '/errors/errorList').ErrorType;
const SwallowUtil = require(global.apiPathPrefix + '/utility/SwallowUtil');
const DBConfig = require(global.apiPathPrefix + '/utility/DBConfig');
const SwallowConst = require(global.apiPathPrefix + '/utility/SwallowConst');
const Bluebird = require('bluebird');

const sequelize = DBConfig.getSequelize();
const OrderModel = DBConfig.OrderModel();
const Coupons = DBConfig.Coupons();
const OrderDeliver = DBConfig.OrderDelivery();
const Payment = DBConfig.Payment();




