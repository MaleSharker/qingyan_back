/**
 * Created by cc on 17/7/11.
 */


const sku = (sequelize, DataTypes) => {
    const SKU = sequelize.define('sku',{

        sku_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        ske_encode: {
            type:DataTypes.STRING,
            allowNull: true,
        },
        price:{
            type: DataTypes.DECIMAL(5,2),
            allowNull: false
        }

    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'sku'
    });

    return SKU;

};

module.exports = sku;

