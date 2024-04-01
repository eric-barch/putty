import { Router } from "express";
import { helloWorld } from "@/controllers/root";
import { addBook, searchBook } from "@/controllers/book";

const routes = Router();

routes.get("/", helloWorld);

routes.get("/book/:isbn", searchBook);

routes.put("/book", addBook);

export default routes;
