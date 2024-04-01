import { Book, PrismaClient } from "@prisma/client";
import axios from "axios";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const searchBook = async (request: Request, response: Response) => {
  const isbn = request.params.isbn;

  const savedBook = await searchDb(isbn);

  if (savedBook) {
    return response.json({
      isbn: savedBook.isbn,
      title: savedBook.title,
    });
  }

  await searchOpenLibrary(request, response);
};

const searchDb = async (isbn: string): Promise<Book | null> => {
  return await prisma.book.findUnique({
    where: {
      isbn: isbn,
    },
  });
};

const searchOpenLibrary = async (request: Request, response: Response) => {
  const isbn = request.params.isbn;
  const openLibraryUrl = `https://openlibrary.org/isbn/${isbn}`;

  try {
    const openLibraryResponse = await axios.get(openLibraryUrl);
    response.send(openLibraryResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      response.status(error.response?.status || 500).send(error.message);
    } else {
      response.status(500).send("An unknown error occurred.");
    }
  }
};

const addBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;
  const { title } = request.body;

  if (!isbn || !title) {
    return response
      .status(400)
      .json({ message: "ISBN and title are required" });
  }

  try {
    const newBook = await prisma.book.create({
      data: {
        isbn,
        title,
      },
    });

    response
      .status(201)
      .json({ message: "Book added successfully", book: newBook });
  } catch (error) {
    console.error("Failed to add book:", error);
    response.status(500).json({ message: "Failed to add the book" });
  }
};

const deleteBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  if (!isbn) {
    return response.status(400).json({ message: "ISBN is required." });
  }

  try {
    await prisma.book.delete({
      where: {
        isbn: isbn,
      },
    });

    return response.status(200).json({ message: "Book deleted successfully." });
  } catch (error) {
    console.error("Failed to delete book:", error);
    return response.status(500).json({ message: "Failed to delete the book." });
  }
};

export { addBook, deleteBook, searchBook };
