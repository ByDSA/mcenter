import mongoose from "mongoose";

export async function createCollectionIfNotExists(collectionName: string) {
  const collections = await mongoose.connection.db.listCollections().toArray();

  if (!collections.some((collection) => collection.name === collectionName))
    await mongoose.connection.db.createCollection(collectionName);
}