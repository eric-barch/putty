import { Router } from "express";
import {
  addBook,
  deleteBook,
  searchBook,
  updateBook,
} from "@/controllers/book";
import { getBooks } from "@/controllers/books";
import { getEvents } from "@/controllers/events";

const routes = Router();

routes.get("/books", getBooks);

routes.get("/book/:isbn", searchBook);
routes.put("/book/:isbn", addBook);
routes.patch("/book/:isbn", updateBook);
routes.delete("/book/:isbn", deleteBook);

routes.get("/events", getEvents);

export default routes;
