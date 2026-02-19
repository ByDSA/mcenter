import mongoose from "mongoose";

// Document shape (mirrors DB)
export interface Doc {
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FullDoc extends Doc {
  _id: mongoose.Types.ObjectId;
}

const NAME = "MyEntity";

export const schemaOdm = new mongoose.Schema<FullDoc>(
  {
    title: { type: String, required: true },
    createdAt: { type: Date, required: true },
    updatedAt: { type: Date, required: true },
  },
  { collection: "my_entities" },
);

export const Model = mongoose.model<FullDoc>(NAME, schemaOdm);