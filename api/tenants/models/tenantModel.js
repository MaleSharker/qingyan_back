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
        unique:true,
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
    ],
    brandList:[{
        type: Schema.Types.ObjectId,
        ref: 'MdseBrand'
    }]


},{timeStamps: true,collection:"tenant_list"});

tenantModel.pre('save',function save(next, done) {
    const tenant = this;
    if (!tenant.isModified('name')){ return next()}
    console.log("length - %s",tenant.name.length);
    if (tenant.name.length <= 2){
        return done({error:'商铺名称太短'})
    }else{
        next()
    }
});


module.exports = mongoose.model('TenantModel',tenantModel);