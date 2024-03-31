import express from "express";
import routes from "./routes";

const api = express();
const port = 3000;

api.use(express.json());
api.use("/api", routes);

api.listen(port, () => {
  console.log(`Dewey API listening on port ${port}`);
});
