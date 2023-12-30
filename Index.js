const connectToMongo = require('./DB/DataBase');
const express = require('express');
const app = express();
var cors = require('cors');
const port =process.env.PORT || 3000;
connectToMongo();
app.use(express.json())//middleware
app.use(cors());

app.use('/api',require('./API/OnBoarding'));

app.listen(port,()=>{
    console.log(`Listening at http://localhost:${port}`);
})