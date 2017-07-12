/**
 * Created by cc on 17/7/11.
 */

const specs = (sequelize, DataTypes) => {

    const Specs = sequelize.define('specs',{
        specs_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull:false
        },
        show_position: {
            type:DataTypes.INTEGER,
            allowNull: true
        },
    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'specs'
    });

    return Specs;
};

module.exports = specs;

