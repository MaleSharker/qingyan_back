/**
 * Created by baichenchen on 2017/8/1.
 */

let SwallowConst = require(global.apiPathPrefix + '/utility/SwallowConst');
let OrderStatus = SwallowConst.OrderStatus;
let OrderStatusKV = SwallowConst.OrderStatusKeyValue;
let SettledStatus = SwallowConst.SettledStatus;
let SettledStatusKV = SwallowConst.SettledStatusKeyValue;

const tenantOrder = (sequelize,DataTypes) => {

    let order = sequelize.define('tenantorder',{

        tenant_order_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        //外键
        // user_order_id:{
        //     type:DataTypes.INTEGER,
        //     allowNull:false
        // },
        // tenant_id:{
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        customer_id:{ //顾客ID
            type:DataTypes.INTEGER,
            allowNull: false,
        },
        customer_msg:{ //顾客留言
            type:DataTypes.STRING,
        },
        total_amount:{ //计算后订单应付金额
            type: DataTypes.DECIMAL(10,2),
        },
        total_amount_settled:{//接收到订单支付成功后写入实际支付金额
            type:DataTypes.DECIMAL(10,2),
        },
        refund_amount:{ //申请退款金额
            type:DataTypes.DECIMAL(10,2)
        },
        refund_settled:{ //实际退款金额
            type:DataTypes.DECIMAL(10,2)
        },
        refund_reason:{ //用户退款原因
            type:DataTypes.STRING
        },
        user_coupon_id:{// 临时保存,支付成功后据此改变用户优惠券使用情况
            type:DataTypes.INTEGER,
        },
        user_address_id:{//临时保存,支付成功后据此写入deliver
            type:DataTypes.INTEGER,
        },
        logistics_amount:{ //物流费用
            type:DataTypes.DECIMAL(10,2),
            allowNull: false,
            defaultValue: 10.00,
        },
        order_status_code:{ //订单状态
            type:DataTypes.ENUM,
            values:OrderStatus,
            defaultValue: OrderStatusKV.pending
        },
        date_order_created:{ //订单创建日期
            type:DataTypes.DATE,
            defaultValue: new Date(),
            allowNull: false
        },
        date_order_payed:{  //订单支付日期
            type:DataTypes.DATE
        },
        tenant_settled_amount:{//订单与商铺结算金额
            type: DataTypes.DECIMAL(10,2),
            allowNull:false,
            defaultValue: 0.0
        },
        settled_status:{//订单结算状态
            type: DataTypes.ENUM,
            values: SettledStatus,
            defaultValue: SettledStatusKV.pending
        }

    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'tenant_order'
    });
    return order;
};

module.exports = tenantOrder;
