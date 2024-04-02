import { Router } from "express";
import {
  addBook,
  deleteBook,
  searchBook,
  updateBook,
} from "@/controllers/book";

const routes = Router();

routes.get("/book/:isbn", searchBook);
routes.put("/book/:isbn", addBook);
routes.patch("/book/:isbn", updateBook);
routes.delete("/book/:isbn", deleteBook);

export default routes;
