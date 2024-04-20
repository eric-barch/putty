import { Router } from "express";
import {
  getAllBooks,
  getBook,
  postBook,
  putBook,
  deleteBook,
} from "@/controllers/book";
import { getBookEvents } from "@/controllers/events";

const routes = Router();

routes.get("/book", getAllBooks);
routes.post("/book/:isbn", postBook);
routes.get("/book/:query", getBook);
routes.put("/book/:isbn", putBook);
routes.delete("/book/:isbn", deleteBook);

routes.get("/book-events", getBookEvents);

export default routes;
