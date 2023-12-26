const mongoose = require('mongoose')
// const mongoDbClient = require("mongodb").MongoClient
const mongoURI ='mongodb://OCR:rj14200227@ac-kz3ysor-shard-00-00.ffjpuvz.mongodb.net:27017,ac-kz3ysor-shard-00-01.ffjpuvz.mongodb.net:27017,ac-kz3ysor-shard-00-02.ffjpuvz.mongodb.net:27017/?ssl=true&replicaSet=atlas-22w8xh-shard-0&authSource=admin&retryWrites=true&w=majority'
mongoose.set("strictQuery", false);
const mongoDB= async()=>{
await mongoose.connect(mongoURI,{useNewUrlParser:true});

const d = mongoose.connection;
d.on('error', console.error.bind(console, 'MongoDB connection error:'));

}
module.exports=mongoDB;