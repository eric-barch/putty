import { Router } from "express";
import path from "path";

const webRoutes = Router();

webRoutes.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "..", "..", "public", "html", "home", "index.html"),
  );
});

export { webRoutes };
