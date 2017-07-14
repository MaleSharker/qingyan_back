/**
 * Created by cc on 17/7/14.
 */

const spuImages = (sequelize, DataTypes) => {

    let SPUImages = sequelize.define('spu_images',{
        index:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true,
            allowNull:false
        },
        image_name:{
            type:DataTypes.STRING,
            required:true,
            unique:true,
            allowNull: false
        },
        image_rank:{
            type:DataTypes.INTEGER,
            allowNull:false
        }
    },{
        timestamps: false,
        freezeTableName:true,
        tableName: 'spu_images'
    });

    return SPUImages;

};

module.exports = spuImages;


