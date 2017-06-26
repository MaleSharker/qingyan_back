/**
 * Created by cc on 17/6/26.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MdseInfoSchema = new Schema({
    mdse_id:{
        type: String,
        Required: 'kindly enter the mdse id'
    },
    created_date: {
        type: Date,
        default: Date.now()
    },
    mdse_desc: {
        type: String,
        Required: 'enter mdse description'
    },
    mdse_sizes: {
        type:[
            {
                size_name: {type:String, default: ""},
                size_origin_price: {type:String, default: ""},
                size_current_price: {type:String, default: ""},
                size_img_url: {type:String, default: ""},
            }
        ]
    },
    mdse_parameters: {
        brand: String,
    },
    mdse_comments: {
        type: [
            {
                profile_url:{type:String, default: ""},
                user_name: {type:String, default: ""},
                size_desc: {type:String, default: ""},
                description: {type:String, default: ""},
                img_list: {
                    type: [{
                        type: String,
                        default: ""
                    }],
                }
            }
        ],
        default :[]
    },
    mdse_questions:{
        type: [
            {
                question:String,
                answer: String
            }
        ],
        default: [],
    },
    manufacturer: {
        type: String,
        default : ""
    },
    mdse_details: {
        type: [
            {
                type:String,
                default: ""
            }
        ],
    },
},{ timestamps: true });


const MdseInfo = mongoose.model('MdseInfo',MdseInfoSchema);

module.exports = MdseInfo;

