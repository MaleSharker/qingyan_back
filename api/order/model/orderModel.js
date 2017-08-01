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
        },
        customer_msg:{
            type:DataTypes.STRING,
        },
        total_amount:{//订单应付金额,每次支付的时候进行计算
            type: DataTypes.DECIMAL(10,2),
        },
        total_amount_settled:{//用户实际支付金额
            type:DataTypes.DECIMAL(10,2),
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
        tableName: 'user_order_list'
    });

    return order;

};


module.exports = orderModel;