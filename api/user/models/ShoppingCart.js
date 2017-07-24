/**
 * Created by baichenchen on 2017/7/23.
 */


const shopCart = (sequelize,DataTypes) => {

    const cart = sequelize.define('shopcart',{

        cart_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
        sku_id:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
        tenant_id:{
            type:DataTypes.INTEGER,
            allowNull: false
        },
        sku_count:{
            type:DataTypes.INTEGER,
            allowNull: false
        }

    },{
        timestamps:true,
        freezeTableName: true,
        tableName: 'shop_cart'
    });

    return cart;

};


module.exports = shopCart;
