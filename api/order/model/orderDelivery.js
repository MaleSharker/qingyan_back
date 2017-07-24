/**
 * Created by baichenchen on 2017/7/23.
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

const orderDelivery = (sequelize, DataTypes) => {

    const delivery = sequelize.define('orderdelivery',{

        deliver_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        logistic_status:{
            type:DataTypes.ENUM,
            values:DeliverStauts
        },
        deliver_name:{
            type:DataTypes.STRING,
            allowNull: false
        },
        deliver_phone:{
            type:DataTypes.STRING,
            allowNull:false
        },
        deliver_address:{
            type:DataTypes.STRING,
            allowNull:false
        },
        logistic_company:{
            type:DataTypes.STRING,
            allowNull: false
        },
        logistic_number:{
            type:DataTypes.STRING,
            allowNull: true
        }

    },{
        timestamps: true,
        freezeTableName: true,
        tableName: 'order_delivery'
    });

    return delivery;

};

module.exports = orderDelivery;