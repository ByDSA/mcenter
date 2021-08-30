import { Document } from "mongoose";
import Interface from "./interface";

export default interface Doc extends Interface, Document {
  comparePassSync(expectedPass: string): boolean;
}
