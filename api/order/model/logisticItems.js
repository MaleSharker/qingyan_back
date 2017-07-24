/**
 * Created by baichenchen on 2017/7/23.
 */

const logisticItems = (sequelize,DataTypes) => {

    const logistic = sequelize.define('logisticsItems',{

        id:{
            type:DataTypes.INTEGER,
            primaryKey:true,
            autoIncrement: true
        },
        time:{
            type:DataTypes.STRING
        },
        context:{
            type:DataTypes.STRING
        }

    },{
        timestamps: false,
        freezeTableName:true,
        tableName: 'logistic_items'
    });

    return logistic;

};

module.exports = logisticItems;

