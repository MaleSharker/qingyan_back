/**
 * Created by baichenchen on 2017/7/23.
 */

const AddressTypes = [
    'home',
    'company',
    'lover',
    'default'
];

const Address = (sequelize,DataTypes) => {

    const address = sequelize.define('address',{

        address_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull:false
        },
        user_id:{
            type:DataTypes.INTEGER,
            allowNull:false,
        },
        address_type:{
            type:DataTypes.ENUM,
            values:AddressTypes,
            defaultValue:'default'
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        country:{
            type: DataTypes.STRING,
            allowNull:false,
            defaultValue:'中国'
        },
        province:{
            type: DataTypes.STRING,
            allowNull: false
        },
        city:{
            type: DataTypes.STRING,
            allowNull: false
        },
        district:{
            type: DataTypes.STRING,
            allowNull: false
        },
        detail:{
            type: DataTypes.STRING,
            allowNull: false
        },
        phone:{
            type: DataTypes.STRING,
            validate:{
                isNumeric:true
            },
            allowNull:false
        },
        is_default:{
            type: DataTypes.BOOLEAN,
            defaultValue:false
        }

    },{
        timestamps: true,
        freezeTableName:true,
        tableName: 'address_list'
    });

    return address;
};


module.exports = Address;