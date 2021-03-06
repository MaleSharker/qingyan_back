/**
 * Created by cc on 17/7/26.
 */

/**
 * 订单状态
 * @type {string[]}
 */
const OrderStatus = [
    'pending',
    'processing',
    'canceled',
    'payment_received',
    'shipped',
    'extended',
    'received',
    'received_auto',
    'commented',
    'retruning',
    'return_goods_received',
    'refunded'
];
const OrderStatusKeyValue = {
    pending:'pending',
    processing:'processing',
    canceled:'canceled',
    paymentReceived:'payment_received',
    shipped:'shipped',
    extended:'extended',
    received:'received',
    receivedAuto:'received_auto',
    commented:'commented',
    retruning:'retruning',
    returnReceived:'return_goods_received',
    refunded:'refunded'
};
exports.OrderStatus = OrderStatus;
exports.OrderStatusKeyValue = OrderStatusKeyValue;

/**
 * 商家订单结算状态
 * @type {string[]}
 */
const SettledStatus = [
    "pending", //待结算
    "part_settled", //部分结算
    "total_settled" //全部结算
];
const SettledStatusKeyValue = {
    pending:"pending", //待结算
    partSettled:"part_settled", //部分结算
    totalSettled:"total_settled" //全部结算
};
exports.SettledStatus = SettledStatus;
exports.SettledStatusKeyValue = SettledStatusKeyValue;

/**
 * 物流状态
 */

const DeliverStauts =[
    'courier_service', //揽件
    'in_transit',  //在途
    'puzzled',  //  疑难
    'signed',   //签收
    'sign_out', //退签
    'delivery', //派件
    'send_back' //退回
];
const DeliverStatusKeyValue = {
    waitDeliver: 'wait_deliver',
    courierService:'courier_service', //揽件
    inTransit:'in_transit',  //在途
    puzzled:'puzzled',  //  疑难
    signed:'signed',   //签收
    signOut:'sign_out', //退签
    delivery:'delivery', //派件
    sendBack:'send_back' //退回
};

exports.DeliverStatus = DeliverStauts;
exports.DeliverStatusKeyValue = DeliverStatusKeyValue;

/**
 * 支付方式
 */
const Channels = [
    'alipay',
    'alipay_wap',
    'alipay_pc_direct',
    'wx',
    'wx_wap',
    'wx_lite',
    'upacp',
    'upacp_wap'
];
const ChannelKeyValues = {
    alipay:'alipay',
    alipay_wap:'alipay_wap',
    alipay_pc_direct:'alipay_pc_direct',
    wx:'wx',
    wx_wap:'wx_wap',
    wx_lite:'wx_lite',
    upacp:'upacp',
    upacp_wap:'upacp_wap'
};

exports.Channels = Channels;
exports.ChannelKeyValues = ChannelKeyValues;

/**
 * 优惠券状态
 */
const CouponStatus = [
    'waiting',
    'using',
    'used',
    'wasted' //失效
];
const CouponStatuKeyValues = {
    waiting: 'waiting',
    using: 'using',
    used: 'used',
    wasted: 'wasted' //失效
};

exports.CouponStatus = CouponStatus;
exports.CouponStatusKeyValus = CouponStatuKeyValues;
