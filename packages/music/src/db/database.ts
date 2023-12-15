import mongoose, { ConnectOptions } from "mongoose";
import { ENVS } from "../env";

// mongoose options
const options: ConnectOptions = {
  autoIndex: false,
};

function generateUrl() {
  // mongodb environment variables
  const { hostname,
    db,
    port,
    user,
    password } = ENVS.mongo;
  let ret = port === undefined ? "mongodb+srv://" : "mongodb://";

  if (user && password)
    ret += `${user}:${password}@`;

  ret += hostname;

  if (port)
    ret += `:${port}`;

  ret += `/${db}`;

  return ret;
}

async function connect() {
  const dbConnectionURL = generateUrl();

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
