import { Router } from "express";
import {
  postBook,
  deleteBook,
  getAllBooks,
  getBook,
  putBook,
} from "@/controllers/book";
import { getBookEvents } from "@/controllers/events";

const routes = Router();

routes.get("/book", getAllBooks);
routes.get("/book/:isbn", getBook);
routes.put("/book/:isbn", postBook);
routes.patch("/book/:isbn", putBook);
routes.delete("/book/:isbn", deleteBook);

routes.get("/book-events", getBookEvents);

export default routes;
