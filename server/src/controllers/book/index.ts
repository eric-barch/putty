import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { searchApis, searchDb } from "./search.helpers";

const prisma = new PrismaClient();

const getAllBooks = async (request: Request, response: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: [
        { lcClass: "asc" },
        { lcTopic: "asc" },
        { lcSubjectCutter: "asc" },
        { lcAuthorCutter: "asc" },
      ],
    });

    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: "Failed to get all books." });
  }
};

const postBook = async (request: Request, response: Response) => {
  const requestBook = request.body;

  try {
    const responseBook = await prisma.book.create({ data: requestBook });
    response.status(201).json(responseBook);
  } catch {
    response.status(500).json({ message: `Failed to post book.`, requestBook });
  }
};

const getBook = async (request: Request, response: Response) => {
  const { query } = request.params;

  try {
    const responseBook = await searchDb(query);
    response.status(200).json({ source: "db", book: responseBook });
  } catch (error) {
    try {
      const responseBook = await searchApis(query);
      response.status(200).json({ source: "apis", book: responseBook });
    } catch {
      response
        .status(500)
        .json({ message: `Failed to get book with ISBN ${query}` });
    }
  }
};

const putBook = async (request: Request, response: Response) => {
  const requestBook = request.body;

  try {
    const responseBook = await prisma.book.update({
      where: {
        id: requestBook.id,
      },
      data: requestBook,
    });
    response.status(200).json(responseBook);
  } catch {
    response.status(500).json({
      message: `Failed to put book.`,
      requestBook,
    });
  }
};

const deleteBook = async (request: Request, response: Response) => {
  const requestBook = request.body;

  try {
    const responseBook = await prisma.book.delete({
      where: {
        id: requestBook.id,
      },
    });
    response.status(200).json(responseBook);
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to delete book.`, requestBook });
  }
};

export { getAllBooks, getBook, postBook, deleteBook, putBook };
