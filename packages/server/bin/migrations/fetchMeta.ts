import mongoose from "mongoose";
import Database from "../../src/main/db/Database";

(async () => {
  // eslint-disable-next-line no-console
  const result = console.log;

  // eslint-disable-next-line no-empty-function, no-console
  console.log = () => {};
  const database = new Database();

  database.init();

  await database.connect();

  const metaCollection = mongoose.connection.collection("meta");
  const docs = await metaCollection.find().toArray();
  const docsObj = docs.reduce((acc, doc) => {
    const {key, value} = doc;

    if (typeof key === "string" || typeof key === "number")
      acc[key] = value;

    return acc;
  },{
  } as {[key: number | string]: string} );

  result(JSON.stringify(docsObj));

  await database.disconnect();
} )();