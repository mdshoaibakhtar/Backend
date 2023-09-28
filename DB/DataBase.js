const mongoose = require('mongoose');
const mongoAtlasURI =  "mongodb+srv://imdshoaibakhtar:itsmdshoaib@cluster1.arf9t2x.mongodb.net/?retryWrites=true&w=majority"

const connectToMongo = () => {
    mongoose.connect(mongoAtlasURI).then(() => {
        console.log('Congratulations! You are now connected');
    }).catch((e) => {
        console.log('Connection failed, something went wrong', e);
    })
}

module.exports = connectToMongo;