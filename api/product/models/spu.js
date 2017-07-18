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
            allowNull: true,
            defaultValue: ''
        },
        brief: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: ""
        },
        detail:{
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status:{
            type:DataTypes.INTEGER,
            defaultValue:1,
            allowNull:false,
            validate: {
                // isIn: [0,1,2,3]
                min: 0,
                max: 3
            }
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'spu_list'
    });

    return SPU;

};

module.exports = spu;

