/**
 * Created by cc on 17/7/10.
 */


const brand = (sequelite, DataTypes) => {

    const Brand = sequelite.define('brand', {

        brand_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        },

        name:{
            type:DataTypes.STRING,
            set:function (val) {
                if (val.length < 1){
                    throw new Error;
                }else {
                    this.setDataValue('name', val);
                }
            }
        },

        description:{
            type: DataTypes.TEXT
        },

        icon:{
            type: DataTypes.STRING
        }

    },{
        timestamps: true,
        freezeTableName: true,
        tableName: 'brand_list'
    });

    return Brand;

};


module.exports = brand;
