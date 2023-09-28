const mongoose = require('mongoose');
const {Schema} = mongoose;

const SignUp = new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const user = mongoose.model('user',SignUp);
module.exports = user;