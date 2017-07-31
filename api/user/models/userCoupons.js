/**
 * Created by YCYL on 2017/7/28.
 */

let couponStatus = require(global.apiPathPrefix + '/utility/SwallowConst').CouponStatus;

const coupons = (sequelize,DataTypes) => {

    const coupon = sequelize.define('usercoupons',{
        user_coupon_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true
        },
        coupon_name:{
            type:DataTypes.STRING,
            allowNull:false
        },
        expire_date:{//过期时间
            type:DataTypes.DATE,
            allowNull:false
        },
        discount:{//折扣价格
            type:DataTypes.FLOAT,
            allowNull: false
        },
        minimum_charge:{//满足使用金额
            type:DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        user_id:{ //所有者ID ,可以是用户,订单,SPU
            type:DataTypes.INTEGER,
            allowNull:false
        },
        tenant_id:{//优惠券所属商铺
            type:DataTypes.INTEGER,
            allowNull: false
        },
        status:{
            type: DataTypes.ENUM,
            values:couponStatus,
            allowNull: false
        }

    },{
        timestamps:true,
        freezeTableName: true,
        tableName: 'user_coupons'
    });

    return coupon;

};


module.exports = coupons;
