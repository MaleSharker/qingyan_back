/**
 * Created by baichenchen on 2017/7/23.
 */

const orderSKU = (sequelize,DataTypes) => {

    const order = sequelize.define('orderSKU',{

        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            allowNull:false,
            autoIncrement: true
        },
        //外键
        // user_order_id:{
        //     type:DataTypes.INTEGER,
        //     allowNull: false
        // },
        // tenant_order_id:{
        //     type: DataTypes.INTEGER,
        //     allowNull: false
        // },
        sku_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        sku_name:{
            type:DataTypes.STRING,
            allowNull: false
        },
        sku_attribute:{
            type:DataTypes.STRING,
            allowNull:false
        },
        sku_price:{
            type:DataTypes.DECIMAL(10,2),
            allowNull:false
        },
        count:{
            type:DataTypes.INTEGER,
            allowNull:false
        },
        sku_image:{
            type:DataTypes.STRING,
            allowNull:false,
        }

    },{
        timestamps:false,
        freezeTableName: true,
        tableName: 'orders_skus'
    });

    return order;

};

module.exports = orderSKU;

