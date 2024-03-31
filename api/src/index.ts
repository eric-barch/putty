import express from "express";

const api = express();
const v1 = express.Router();
const port = 3000;

api.use(express.json());
api.use("/api/v1", v1);

v1.get("/", (req, res) => {
  res.send("Hello, World!");
});

v1.post("/books/:isbn", (req, res) => {
  const { isbn } = req.params;
  res.status(200).send(`Book with ISBN ${isbn} processed`);
});

api.listen(port, () => {
  console.log(`Dewey API listening on port ${port}`);
});
