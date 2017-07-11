/**
 * Created by cc on 17/7/11.
 */

const specsChoice = (sequelize, DataTypes) => {

    const SpecsChoice = sequelize.define('specschoice', {

        choice_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false
        },

        name: {
            type: DataTypes.STRING,
            allowNull: false
        }

    }, {
        timestamps: true,
        freezeTableName: true,
        tableName: 'specs_choice'
    });

    return SpecsChoice;

};

module.exports = specsChoice;
