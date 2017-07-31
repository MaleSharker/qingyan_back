/**
 * Created by cc on 17/7/11.
 */


const sku = (sequelize, DataTypes) => {
    const SKU = sequelize.define('sku',{

        sku_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        },
        ske_encode: {
            type:DataTypes.STRING,
            allowNull: true,
            defaultValue: ''
        },
        price:{
            type: DataTypes.DECIMAL(10,2),
        },
        stock:{
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue:0
        },
        sale_count:{
            type:DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        name:{
            type:DataTypes.STRING,
            allowNull:false
        }

    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'sku_list'
    });

    return SKU;

};

module.exports = sku;

