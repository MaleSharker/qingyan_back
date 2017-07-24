/**
 * Created by baichenchen on 2017/7/23.
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

const orderModel = (sequelize, DataTypes) => {

    const order = sequelize.define('order',{

        order_id:{
            type: DataTypes.Number,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        customer_id:{
            type:DataTypes.Number,
            allowNull: false
        },
        payment_id:{
            type:DataTypes.Number
        },
        order_status_code:{
            type:DataTypes.ENUM,
            values:OrderStatus
        },
        date_order_created:{
            type:DataTypes.DATE,
            defaultValue: Date.now(),
            allowNull: false
        },
        date_order_payed:{
            type:DataTypes.DATE
        },
        other_order_details:{
            type:DataTypes.STRING
        },

    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'order_list'
    });

    return order;

};


module.exports = orderModel;