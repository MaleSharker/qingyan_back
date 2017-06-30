/**
 * Created by cc on 17/6/27.
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');


const userSchema = new Schema({
    phone: { type: String, unique: true ,default:""},
    email: { type: String, default:""},
    password: String,
    passwordResetToken: String,
    passwordResetExpires: { type:Date, default:Date.now() },

    wechat: { type: String, default: ""},
    sina: { type: String,  default:"" },
    facebook: { type: String, default:"" },
    github: { type: String, default:"" },
    steam: String,
    token: { type:String, default:""},
    verifyCode: {
        type: [
            {
                code: { type: String, default:''},
                createDate: { type:Date, default:Date.now() },
                codeType: {
                    type:String,
                    enum:['register','login','retrieve']
                }
            }
        ],
        default: []
    },

    profile: {
        name: { type:String, default:'Coder' },
        gender: { type:String, enum:["Male","Female","Martian"], default:"Martian" },
        location: { type:String, default: "Mars" },
        website: { type:String, default:"https://www.baidu.com"},
        picture: { type:String, default:"" }
    }

},{ timeStamps: true});

/**
 * Password hash midleware
 */
userSchema.pre('save',function save(next) {
    const user = this;
    if (!user.isModified('password')){ return next();}
    bcrypt.genSalt(10, (err, salt) => {
        if (err){ return next(err); }
        bcrypt.hash(user.password, salt, null, (err, hash) => {
            if (err) { return next(err); }
            user.password = hash;
            next();
        });
    });
});

/**
 * Helper method for validating user's password
 */
userSchema.methods.comparePassword = function comparePassword(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
        cb(err, isMatch);
    });
};

/**
 * Helper method for getting user's gravatar
 */
userSchema.methods.gravatar = function gravatar(size) {
    if (!size){
        size = 200;
    }
    if (!this.email){
        return `https://gravatar.com/avatar/?s=${size}&d=retro`;
    }
    const md5 = crypto.createHash('md5').update(this.email().digest('hex'));
    return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

