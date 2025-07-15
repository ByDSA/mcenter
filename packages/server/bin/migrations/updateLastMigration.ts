import mongoose from "mongoose";
import { Database } from "../../src/main/db/Database";

(async () => {
  const lastMigration = +process.argv[2];

  if (typeof lastMigration !== "number" || Number.isNaN(lastMigration) || !Number.isInteger(lastMigration))
    throw new Error(`lastMigration is invalid: ${lastMigration}`);

  // eslint-disable-next-line no-empty-function, no-console
  console.log = () => {};
  const database = new Database();

  await database.connect();

  const metaCollection = mongoose.connection.collection("meta");
  const doc = await metaCollection.findOne( {
    key: "migrations",
  } );

  if (!doc)
    throw new Error("doc is undefined");

  if (!doc.value)
    throw new Error("doc.value is undefined");

  await metaCollection.updateOne( {
    key: "migrations",
  }, {
    $set: {
      value: {
        ...doc.value,
        lastMigration,
      },
    },
  } );

  await database.disconnect();

  console.log("New migrations.lastMigration:", lastMigration);
} )();