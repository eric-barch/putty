import { requestFromServer, webRoutes } from "./routes";
import express from "express";
import path from "path";
import { env } from "process";

const web = express();
const port = env.WEB_PORT;

/** Forward API requests to server. */
web.use("/api", requestFromServer);

/** Send other requests to web router. */
web.use("/", webRoutes);

/** Serve static files from ../public. */
web.use(express.static(path.join(__dirname, "..", "public")));

/** Start server. */
web.listen(port, () => {
  console.log(`Dewey web listening on port ${port}`);
});
