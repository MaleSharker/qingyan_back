/**
 * Created by cc on 17/7/10.
 */


const tenant = (sequelize, DataTypes) => {
    const Tenant = sequelize.define('tenant', {

        name:{
            type:DataTypes.STRING,
            unique:true,
            set:function (val) {
                if (val.length < 2){
                    throw new Error;
                }else {
                    this.setDataValue('name',val);
                }
            }
        },
        tenant_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            allowNull: true,
            autoIncrement: true
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
            defaultValue: 'open',
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
