import express from "express";
import net from "net";

const deweyApi = express();
const port = 3000;

deweyApi.get("/test-db", (req, res) => {
  const client = new net.Socket();

  client.connect(5432, "db", () => {
    res.send("Connected to server!");
    client.end();
  });

  client.on("error", (err) => {
    res.status(500).send(`Error connecting to db: ${err.message}`);
  });
});

deweyApi.get("/", (req, res) => {
  res.send("Hello, World!");
});

deweyApi.listen(port, () => {
  console.log(`Dewey API listening on port ${port}`);
});
