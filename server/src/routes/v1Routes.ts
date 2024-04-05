import { Router } from "express";
import {
  addBook,
  deleteBook,
  getAllBooks,
  searchBook,
  updateBook,
} from "@/controllers/book";
import { getBookEvents } from "@/controllers/events";

const routes = Router();

routes.get("/book", getAllBooks);
routes.get("/book/:isbn", searchBook);
routes.put("/book/:isbn", addBook);
routes.patch("/book/:isbn", updateBook);
routes.delete("/book/:isbn", deleteBook);

routes.get("/book-events", getBookEvents);

export default routes;
