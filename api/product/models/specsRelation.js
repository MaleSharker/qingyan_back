/**
 * Created by cc on 17/7/11.
 */

const specsRelation = (sequelize, DataTypes) => {

    const SpecsRelation = sequelize.define('specsrelation',{

        relationID: {
            type: DataTypes.INTEGER
        }

    },{
        timestamps: true,
        freezeTableName: true,
        tableName: 'specs_relation'
    });

    return SpecsRelation;

};

module.exports = specsRelation;

