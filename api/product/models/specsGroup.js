/**
 * Created by cc on 17/7/11.
 */

const specsGroup = (sequelize, DataTypes) => {

    const SpecsGroup = sequelize.define('specsgroup',{

        group_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull:false
        }
    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'category_list'
    });

    return SpecsGroup;

};

module.exports = specsGroup;

