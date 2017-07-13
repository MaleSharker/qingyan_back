/**
 * Created by cc on 17/7/11.
 */

const category = (sequelize, DataTypes) => {

    const Category = sequelize.define('category', {
        category_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        },
        name:{
            type: DataTypes.STRING,
            unique: true,
            allowNull:false
        },
        category_encode:{
            type:DataTypes.INTEGER,
            allowNull: true,
            defaultValue:0
        }
    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'category_list'
    });

    return Category;

};

module.exports = category;
