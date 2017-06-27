/**
 * Created by cc on 17/6/27.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const crypto = require('cryptiles');

const mdseCategory = new Schema({
    category_list: {
        type:[
            {
                name:String,
                id:{
                    type: String,
                    default: ""
                }
            }
        ]
    }
},{timeStamps: true});

const MdseCategory = mongoose.model('MdseCategory',mdseCategory);

module.exports = MdseCategory;

