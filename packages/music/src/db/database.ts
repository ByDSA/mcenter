import mongoose, { ConnectOptions } from "mongoose";
import { assertEnv } from "../env";

// mongoose options
const options: ConnectOptions = {
  autoIndex: false,
};

function generateUrl() {
  // mongodb environment variables
  const { MONGO_HOSTNAME,
    MONGO_DB,
    MONGO_PORT,
    MONGO_USER,
    MONGO_PASSWORD } = process.env;
  let ret = MONGO_PORT === undefined ? "mongodb+srv://" : "mongodb://";

  if (MONGO_USER && MONGO_PASSWORD)
    ret += `${MONGO_USER}:${MONGO_PASSWORD}@`;

  ret += MONGO_HOSTNAME;

  if (MONGO_PORT)
    ret += `:${MONGO_PORT}`;

  ret += `/${MONGO_DB}`;

  return ret;
}

async function connect() {
  assertEnv();

  const dbConnectionURL = generateUrl();

  console.log("dbConnectionURL", dbConnectionURL);

  await mongoose.connect(dbConnectionURL, options);
}

async function disconnect() {
  await mongoose.disconnect();
}

async function connection(f: ()=> void) {
  connect();
  await f();
  disconnect();
}

export {
  connect, connection, disconnect, mongoose,
};
