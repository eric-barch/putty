import express from "express";
import routes from "./routes";

const server = express();
const port = 3001;

server.use(express.json());
server.use("/", routes);

server.listen(port, () => {
  console.log(`Dewey server listening.`);
});
