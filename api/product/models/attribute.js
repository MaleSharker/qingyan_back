/**
 * Created by cc on 17/7/11.
 */

const attribute = (sequelize, DataTypes) => {

    const Attribute = sequelize.define('attribute', {
        attri_id: {
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type:DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'attribute_list'
    });

    return Attribute;

};


module.exports = attribute;
