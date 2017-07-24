/**
 * Created by baichenchen on 2017/7/23.
 */

const CouponTypes = [
    'personal',
    'order',
    'tenant',
    'spu',
    'system'
];

const coupons = (sequelize,DataTypes) => {

    const coupon = sequelize.define('coupons',{
        coupon_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true
        },
        coupon_type:{
            type:DataTypes.ENUM,
            values:CouponTypes,
            allowNull:false
        },
        coupon_name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        grant_count:{
            type:DataTypes.INTEGER,
            defaultValue:0
        },
        used_count:{
            type:DataTypes.INTEGER,
            defaultValue:0
        },
        expire_date:{
            type:DataTypes.DATE,
            allowNull:false
        },
        discount:{
            type:DataTypes.FLOAT,
            allowNull: false
        },
        owner_id:{ //所有者ID ,可以是店铺,用户,订单,SPU
            type:DataTypes.INTEGER
        }

    },{
        timestamps:true,
        freezeTableName: true,
        tableName: 'coupons'
    });

    return coupon;

};


module.exports = coupons;
