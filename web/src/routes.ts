import { Router } from "express";
import path from "path";

const routes = Router();

routes.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

export default routes;
