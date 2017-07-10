/**
 * Created by baichenchen on 2017/7/5.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const brand = new Schema({
    name:{
        type:String,
        required: true
    },

    description:String,

    icon:String,

    _creater:{
        type: Schema.Types.ObjectId,
        ref: 'TenantModel'
    },

    tenantID:{
        type:String,
        required:true
    },

    spuList:[
        {
            spuID:{
                type: String,
                unique: true
            }
        }
    ]

},{timeStamps: true, collection: 'brand_list'});

brand.pre('save',function save(next,done) {
    let tempBrand = this;
    if (!tempBrand.isModified('name')){ return next();}
    if (tempBrand.name.length < 2){
        return done({error:'品牌名称至少两个字符'});
    }
    next();
});

const Brand = mongoose.model('MdseBrand',brand);

module.exports = Brand;