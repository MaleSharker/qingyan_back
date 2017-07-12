/**
 * Created by cc on 17/7/11.
 */

const spu = (sequelize, DataTypes) => {

    const SPU = sequelize.define('spu', {
        spu_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        },
        name:{
            type:DataTypes.STRING,
            allowNull: false
        },
        spu_encode: {
            type: DataTypes.STRING,
            allowNull: true
        },
        brief: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ""
        },
        detail:{
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'spu_list'
    });

    return SPU;

};

module.exports = spu;

