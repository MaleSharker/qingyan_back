/**
 * Created by cc on 17/7/24.
 */

const channels = require(global.apiPathPrefix + '/utility/SwallowConst').Channels;

const paymentMethod = (sequelize,DataTypes) => {

    const payment = sequelize.define('paymentmethod',{

        payment_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true
        },
        channel_id:{
            type:DataTypes.STRING,
        },
        object:DataTypes.STRING,
        created: DataTypes.BIGINT,
        liveModel: DataTypes.BOOLEAN,
        paid: DataTypes.BOOLEAN,
        refunded: DataTypes.BOOLEAN,
        app: DataTypes.STRING,
        channel: {
            type: DataTypes.ENUM,
            values: channels
        },
        order_no:DataTypes.STRING,
        client_ip: DataTypes.STRING,
        amount: DataTypes.DECIMAL(10,2),
        amount_settle: DataTypes.DECIMAL(10, 2),
        currency: DataTypes.STRING,
        subject: DataTypes.STRING,
        body: DataTypes.STRING,
        extra: DataTypes.STRING,
        time_paid:DataTypes.STRING,
        time_expire: DataTypes.STRING,
        time_settle: DataTypes.STRING,
        transaction_no: DataTypes.STRING,
        refunds: DataTypes.STRING,
        amount_refunded: DataTypes.INTEGER,
        failure_code:DataTypes.INTEGER,
        failure_msg:DataTypes.STRING,
        metadata:DataTypes.STRING,
        credential:DataTypes.STRING,
        description:DataTypes.STRING

    },{
        timestamps: true,
        freezeTableName: true,
        tableName: 'payment'
    });

    return payment

};


module.exports = paymentMethod;

