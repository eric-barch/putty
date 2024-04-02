import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const getBooks = async (request: Request, response: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        dewey: "asc",
      },
    });
    response.json(books);
  } catch (error) {
    response.status(500).json({ error: "Failed to retrieve books." });
  }
};

export { getBooks };
