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