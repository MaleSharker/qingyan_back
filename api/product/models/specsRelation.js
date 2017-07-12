/**
 * Created by cc on 17/7/11.
 */

const specsRelation = (sequelize, DataTypes) => {

    const SpecsRelation = sequelize.define('specsrelation',{

        spec_relation_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: true,
        }

    },{
        timestamps: true,
        freezeTableName: true,
        tableName: 'specs_relation'
    });

    return SpecsRelation;

};

module.exports = specsRelation;

