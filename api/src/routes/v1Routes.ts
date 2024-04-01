import { Router } from "express";
import { helloWorld } from "@/controllers/root";
import { addBook, deleteBook, searchBook } from "@/controllers/book";

const routes = Router();

routes.get("/", helloWorld);

routes.get("/book/:isbn", searchBook);

routes.put("/book/:isbn", addBook);

routes.delete("/book/:isbn", deleteBook);

export default routes;
