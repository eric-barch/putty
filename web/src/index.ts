import { requestFromServer, webRoutes } from "./routes";
import express from "express";
import path from "path";

const web = express();
const port = 3000;

/** Forward API requests to server. */
web.use("/api", requestFromServer);

/** Send other requests to web router. */
web.use("/", webRoutes);

/** Serve static files from ../public. */
web.use(express.static(path.join(__dirname, "..", "public")));

// Start the server
web.listen(port, () => {
  console.log(`Dewey web listening on port ${port}`);
});
