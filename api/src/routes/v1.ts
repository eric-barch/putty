import { Router } from "express";
import { helloWorld } from "@/controllers/root";
import { lookUpBook } from "@/controllers/books";

const router = Router();

router.get("/", helloWorld);

router.post("/books/:isbn", lookUpBook);

export default router;
