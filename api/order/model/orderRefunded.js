/**
 * Created by YCYL on 2017/7/31.
 */



const orderRefund = (sequelize,DataTypes) => {

    let refund = sequelize.define('orderrefunded',{

        id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        refund_id:{
            type:DataTypes.STRING
        },
        //外键
        // tenant_order_id:{
        //     type: DataTypes.INTEGER,
        //     allowNull:false
        // },
        refund_created: {
            type: DataTypes.INTEGER
        },
        livemode:{
            type: DataTypes.BOOLEAN,
        },
        type: DataTypes.STRING,
        pending_webhooks: DataTypes.INTEGER,
        request: DataTypes.STRING,
        object: DataTypes.STRING,
        object_id: DataTypes.STRING,
        order_no: DataTypes.STRING,
        amount: DataTypes.INTEGER,
        created: DataTypes.BIGINT,
        succeed: DataTypes.BOOLEAN,
        status: DataTypes.STRING,
        time_succeed: DataTypes.STRING,
        description: DataTypes.STRING,
        failure_code: DataTypes.STRING,
        failure_msg: DataTypes.STRING,
        metadata: DataTypes.STRING,
        charge: DataTypes.STRING,
        charge_order_no: DataTypes.STRING,
        transaction_no: DataTypes.STRING
    },{
        timestamps: true,
        freezeTableName: true,
        tableName: 'order_refunded'
    });

    return refund;

};


module.exports = orderRefund;

