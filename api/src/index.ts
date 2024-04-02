import express from "express";
import path from "path";
import routes from "./routes";

const api = express();
const port = 3000;

api.use(express.json());
api.use("/api", routes);

api.use(express.static(path.join(__dirname, "..", "public")));
api.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

api.listen(port, () => {
  console.log(`Dewey API listening on port ${port}`);
});
