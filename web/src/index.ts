import express from "express";
import path from "path";
import routes from "./routes";

const web = express();
const port = 3000;

web.use(express.static(path.join(__dirname, "..", "public")));
web.use("/", routes);

web.listen(port, () => {
  console.log(`Dewey web listening.`);
});
