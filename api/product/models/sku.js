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
        },
        price:{
            type: DataTypes.DECIMAL(5,2),
        }

    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'sku_list'
    });

    return SKU;

};

module.exports = sku;

