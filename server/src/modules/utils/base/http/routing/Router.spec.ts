import express from "express";

const app = express();
const PORT = 8011;

app.listen(PORT, () => {
  console.log(`Server Listening on ${PORT}`);
} );