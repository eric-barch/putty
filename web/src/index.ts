import express from "express";
import path from "path";
import { env } from "process";
import { serverRoutes, webRoutes } from "./routes";

const web = express();
const port = env.WEB_PORT;

web.use("/api", serverRoutes);
web.use("/", webRoutes);

web.use(express.static(path.join(__dirname, "..", "public")));

web.listen(port, () => {
  console.log(`Dewey web listening on port ${port}`);
});
