const mongoose = require('mongoose');
const {Schema} = mongoose;

const Login = new Schema({
    username:{
        type:String,
    },
    email:{
        type:String,
    },
    password:{
        type:String,
        required:true
    }
})

const user = mongoose.model('user',Login);
module.exports = user;