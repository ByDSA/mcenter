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
    MONGO_PORT
} = process.env;

const dbConnectionURL = {
    'LOCALURL': `mongodb://${MONGO_HOSTNAME}:${MONGO_PORT}/${MONGO_DB}`
};

function connect() {
    console.log(`Connecting to ${dbConnectionURL.LOCALURL}...`);
    mongoose.connect(dbConnectionURL.LOCALURL, options);
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Mongodb Connection Error:' + dbConnectionURL.LOCALURL));
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
