/**
 * Created by cc on 17/6/27.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('cryptiles');

const mdseCategory = new Schema({
    super_category:{
        category_name:String,
        category_index:{
            type:Number,
            min: 10,
            max: 99,
            unique: true
        },
        category:[{
            category_name:String,
            category_index:{
                type:Number,
                min: 10000,
                max: 99999,
                unique: true
            },
            sub_category:[{
                category_name:String,
                category_index:{
                    type:Number,
                    min: 100000000,
                    max: 999999999,
                    unique: true
                },
            }]
        }]
    }
},{timeStamps: true, collection: 'mdse_category_list'});



const MdseCategory = mongoose.model('MdseCategory',mdseCategory);

module.exports = MdseCategory;

