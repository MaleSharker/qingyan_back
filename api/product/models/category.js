/**
 * Created by cc on 17/7/11.
 */

const category = (sequelize, DataTypes) => {

    const Category = sequelize.define('category', {
        category_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },
        name:{
            type: DataTypes.STRING,
            allowNull:false
        },
        category_encode:{
            type:DataTypes.INTEGER,
            allowNull: false
        }
    },{
        timestamps: false,
        freezeTableName: true,
        tableName: 'category_list'
    });

    return Category;

};

module.exports = category;
