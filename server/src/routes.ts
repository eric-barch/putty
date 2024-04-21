import { Router } from "express";
import {
  getAllBooks,
  getBook,
  postBook,
  putBook,
  deleteBook,
} from "@/controllers/book";

const routes = Router();

routes.get("/book", getAllBooks);
routes.post("/book", postBook);
routes.get("/book/:query", getBook);
routes.put("/book", putBook);
routes.delete("/book", deleteBook);

export default routes;
