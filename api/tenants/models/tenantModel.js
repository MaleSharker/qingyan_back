/**
 * Created by cc on 17/7/4.
 * 商户状态: open,close
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tenantModel = new Schema({

    name:{
        type:String,
        Required: 'You have to make a name to your Tenant.',
        unique:true
    },
    tenantID:{
        type:Number,
        unique:true,
        required: true
    },
    ownerID:{
        type:Number,
        unique: true,
        required: true
    },
    tenantDesc:{
        descText:{
            type:String,
            default: ''
        },
        descUrl:{
            type:String,
            default:''
        }
    },
    status:{
        type:String,
        enum:['open','close'],
        default: 'open'
    },
    spuList:[
        {
            spuID:{
                type: String,
                unique: true
            }
        }
    ]


},{timeStamps: true,collection:"tenant_list"});



module.exports = mongoose.model('TenantModel',tenantModel);