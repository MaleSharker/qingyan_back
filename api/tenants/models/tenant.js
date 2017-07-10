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
        tenantID:{
            type:DataTypes.INTEGER,
            unique:true,
            allowNull: false
        },
        ownerID:{
            type:DataTypes.INTEGER,
            unique: true,
            allowNull:false
        },
        // tenantDesc:{
        //     descText:{
        //         type:DataTypes.TEXT,
        //         // defaultValue:''
        //     },
        //     descUrl:{
        //         type:DataTypes.STRING,
        //         // defaultValue:''
        //     }
        // },
        status:{
            type:DataTypes.ENUM,
            values:['open','close'],
            // defaultValue: 'open'
        }
    },{
        timestamps: true,
        paranoid: false,
        freezeTableName: true,
        tableName: 'tenant_list'
    });

    return Tenant;
};

module.exports = tenant;
