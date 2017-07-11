/**
 * Created by cc on 17/7/11.
 */

const attriChoice = (sequelize, DataTypes) => {

    const AttriChoice = sequelize.define('attrichoice', {
        choice_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement:true
        },
        value: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'attri_choice'
    });

    return AttriChoice;

};


module.exports = attriChoice;
