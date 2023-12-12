import { config } from "dotenv";

// live-tests envs
config( {
  path: ".env",
} );

// Server envs
config( {
  path: "../../.env",
} );

// Project envs
config( {
  path: "../../../.env",
} );