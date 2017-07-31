/**
 * Created by baichenchen on 2017/7/23.
 */

const SwallowConst = require(global.apiPathPrefix + '/utility/SwallowConst');

const OrderStatus = SwallowConst.OrderStatus;

const orderModel = (sequelize, DataTypes) => {

    const order = sequelize.define('ordermodel',{

        order_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        customer_id:{
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue:''
        },
        customer_msg:{
            type:DataTypes.STRING,
        },
        payment_id:{
            type:DataTypes.INTEGER
        },
        total_amount:{
            type:DataTypes.DECIMAL(10,2),
            allowNull: false,
        },
        user_coupon_id:{// 临时保存,支付成功后据此改变用户优惠券使用情况
            type:DataTypes.INTEGER,
        },
        user_address_id:{//临时保存,支付成功后据此写入deliver
            type:DataTypes.INTEGER,
        },
        order_status_code:{
            type:DataTypes.ENUM,
            values:OrderStatus
        },
        date_order_created:{
            type:DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false
        },
        date_order_payed:{
            type:DataTypes.DATE
        },
        other_order_details:{
            type:DataTypes.STRING
        },
        order_type:{
            type: DataTypes.INTEGER,
            allowNull: false,
            validate:{
                isIn:[[1,2]]  //1:直接购买 2:购物车结算
            }
        }
    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'order_list'
    });

    return order;

};


module.exports = orderModel;