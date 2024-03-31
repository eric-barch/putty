import { Router } from "express";
import { helloWorld } from "@/controllers/root";
import { lookUpBook } from "@/controllers/book";

const routes = Router();

routes.get("/", helloWorld);

routes.post("/book/:isbn", lookUpBook);

export default routes;
