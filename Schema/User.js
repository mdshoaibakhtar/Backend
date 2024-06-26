const mongoose = require('mongoose');
const {Schema} = mongoose;

const UsersSchema = new Schema({
    firstName :{
        type:String,
        required:true,
    },
    mobileNumber :{
        type:Number,
        required:true,
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
    confirmPassword:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default:Date.now
    }
})

const user = mongoose.model('user',UsersSchema);
module.exports = user;