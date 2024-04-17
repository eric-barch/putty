import express from "express";
import routes from "./routes";
import { env } from "process";

const server = express();
const port = env.SERVER_PORT;

server.use(express.json());
server.use("/", routes);

server.listen(port, () => {
  console.log(`Dewey server listening on port ${port}.`);
});
