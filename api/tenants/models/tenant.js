/**
 * Created by cc on 17/7/10.
 */


const tenant = (sequelize, DataTypes) => {
    const Tenant = sequelize.define('tenant', {

        tenant_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true,
            autoIncrement: true
        },
        name:{
            type:DataTypes.STRING,
            unique:true,
            allowNull: false,
            validate:{
                len: [2, 20]
            }
        },
        ownerID:{
            type:DataTypes.INTEGER,
            unique: true,
            allowNull:false
        },
        descText:{
            type:DataTypes.TEXT,
        },
        descUrl:{
            type:DataTypes.STRING,
            defaultValue:''
        },
        status:{
            type:DataTypes.ENUM,
            values:['open','close'],
            defaultValue: 'close',
            allowNull: false
        }
    },{
        timestamps: true,
        freezeTableName: true,
        tableName: 'tenant_list'
    });

    return Tenant;
};

module.exports = tenant;
