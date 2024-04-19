import { Router } from "express";
import {
  getAllDbBooks,
  getBook,
  postBook,
  putBook,
  deleteBook,
} from "@/controllers/book";
import { getBookEvents } from "@/controllers/events";

const routes = Router();

routes.get("/book", getAllDbBooks);
routes.post("/book/:isbn", postBook);
routes.get("/book/:query", getBook);
routes.put("/book/:isbn", putBook);
routes.delete("/book/:isbn", deleteBook);

routes.get("/book-events", getBookEvents);

export default routes;
