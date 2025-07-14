import mongoose from "mongoose";
import z from "zod";

export async function createCollectionIfNotExists(collectionName: string) {
  const collections = await mongoose.connection.db.listCollections().toArray();

  if (!collections.some((collection) => collection.name === collectionName))
    await mongoose.connection.db.createCollection(collectionName);
}

export const MongoSchema = z.object( {
  _id: z.instanceof(mongoose.Types.ObjectId).optional(),
  __v: z.number().optional(),
} );