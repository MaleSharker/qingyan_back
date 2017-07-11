/**
 * Created by cc on 17/7/11.
 */


const attriRelation = (sequelize, DataTypes) => {

    const AttriRelation = sequelize.define('attrirelation', {
        relation_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    }, {
        timestamps: false,
        freezeTableName: true,
        tableName: 'attri_relation'
    });

    return AttriRelation;

};

module.exports = attriRelation;

