import { loadEnv } from "@actions/utils/env";
import mongoose from "mongoose";

loadEnv();

// mongoose options
const options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
  autoIndex: false,
  poolSize: 10,
  bufferMaxEntries: 0,
};
// mongodb environment variables
const { MONGO_HOSTNAME,
  MONGO_DB,
  MONGO_PORT,
  MONGO_USER,
  MONGO_PASSWORD } = process.env;
const dbConnectionURL = generateUrl();

function generateUrl() {
  let ret = "mongodb+srv://";

  if (MONGO_USER && MONGO_PASSWORD)
    ret += `${MONGO_USER}:${MONGO_PASSWORD}@`;

  ret += MONGO_HOSTNAME;

  if (MONGO_PORT)
    ret += `:${MONGO_PORT}`;

  ret += `/${MONGO_DB}`;

  return ret;
}

export async function connect() {
  await mongoose.connect(dbConnectionURL, options);
}

export async function disconnect() {
  await mongoose.disconnect();
}

export async function connection(f: ()=> void) {
  connect();
  await f();
  disconnect();
}
