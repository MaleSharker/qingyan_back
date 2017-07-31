/**
 * Created by baichenchen on 2017/7/29.
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
            allowNull:false,
            defaultValue:'tenant'
        },
        coupon_name:{
            type:DataTypes.STRING,
            allowNull:false,
        },
        max_grant_count:{//最大发放数量
            type:DataTypes.INTEGER,
            allowNull: false
        },
        grant_count:{//发放数量
            type:DataTypes.INTEGER,
            defaultValue:0
        },
        used_count:{//使用数量
            type:DataTypes.INTEGER,
            defaultValue:0
        },
        expire_date:{//过期时间
            type:DataTypes.DATE,
            allowNull:false
        },
        discount:{//折扣价格
            type:DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        minimum_charge:{//满足使用金额
            type:DataTypes.DECIMAL(10,2),
            allowNull: false
        },
        tenant_id:{ //店铺ID
            type:DataTypes.INTEGER
        },
        is_enabled:{//是否可用
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }

    },{
        timestamps:true,
        freezeTableName: true,
        tableName: 'coupons'
    });

    return coupon;

};


module.exports = coupons;