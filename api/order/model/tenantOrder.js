/**
 * Created by baichenchen on 2017/8/1.
 */

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
        customer_id:{
            type:DataTypes.INTEGER,
            allowNull: false,
        },
        customer_msg:{
            type:DataTypes.STRING,
        },
        total_amount_settled:{//接收到订单支付成功后写入实际支付金额
            type:DataTypes.DECIMAL(10,2),
            allowNull: false,
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
        tenant_settled_amount:{
            type: DataTypes.DECIMAL(10,2),
            allowNull:false,
            defaultValue: 0.0
        }

    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'tenant_order'
    });
    return order;
};

module.exports = tenantOrder;
