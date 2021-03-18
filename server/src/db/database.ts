import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

// mongoose options
const options = {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
    autoIndex: false,
    poolSize: 10,
    bufferMaxEntries: 0
};

// mongodb environment variables
const {
    MONGO_HOSTNAME,
    MONGO_DB,
    MONGO_PORT,
    MONGO_USER,
    MONGO_PASSWORD
} = process.env;

const dbConnectionURL = generateUrl();

function generateUrl() {
    let ret = "mongodb+srv://";
    if (MONGO_USER && MONGO_PASSWORD) {
        ret += MONGO_USER + ":" + MONGO_PASSWORD + "@";
    }

    ret += MONGO_HOSTNAME;
    if (MONGO_PORT)
        ret += ":" + MONGO_PORT;

    ret += "/" + MONGO_DB;

    return ret;
}

function connect() {
    console.log(`Connecting to ${dbConnectionURL}...`);
    mongoose.connect(dbConnectionURL, options);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Mongodb Connection Error:' + dbConnectionURL));
    db.once('open', () => {
        // we're connected !
        console.log('Mongodb Connection Successful!');
    });
    db.once('close', () => {
        console.log('Mongodb Connection Closed!');
    });
}

function disconnect() {
    mongoose.disconnect();
}

async function connection(f: () => void) {
    connect();
    await f();
    disconnect();
}

export { mongoose, connect, disconnect, connection };
