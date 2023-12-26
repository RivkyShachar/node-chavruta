const mongoose = require('mongoose');
const {config} = require("../config/secret")

main().catch(err => console.log(err));

async function main() {
    mongoose.set('strictQuery', false);
    await mongoose.connect(`mongodb+srv://${config.userDb}:${config.passDb}@chavrutadb.mdwajkj.mongodb.net/chavruta`);
    console.log("mongo connect started");
}