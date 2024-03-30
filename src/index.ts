import express from "express";

const deweyApi = express();
const port = 3000;

deweyApi.get("/", (req, res) => {
  res.send("Hello, World!");
});

deweyApi.listen(port, () => {
  console.log(`Dewey API listening on port ${port}`);
});
