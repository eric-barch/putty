import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const searchBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    await searchDb(isbn, response);
  } catch {
    await searchOpenLibrary(isbn, response);
  }
};

const searchDb = async (isbn: string, response: Response) => {
  const book = await prisma.book.findUniqueOrThrow({
    where: {
      isbn,
    },
  });

  response.json({ ...book });
};

const searchOpenLibrary = async (isbn: string, response: Response) => {
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

  try {
    const book = await prisma.book.create({
      data: {
        isbn,
        isCheckedIn: true,
        ...request.body,
      },
    });

    response.status(201).json({ message: "Book added successfully", book });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to add book with ISBN ${isbn}` });
  }
};

const updateBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;
  const { action } = request.body;

  switch (action) {
    case "checkIn":
      await checkInBook(isbn, response);
      break;
    case "checkOut":
      await checkOutBook(isbn, response);
      break;
    default:
      response.status(400).json({
        message: `Failed to update book with ISBN ${isbn}. Unrecognized action: ${action}`,
      });
  }
};

const checkInBook = async (isbn: string, response: Response) => {
  try {
    await prisma.book.update({
      where: {
        isbn,
      },
      data: {
        isCheckedIn: true,
      },
    });
    response.status(200).json({
      message: `Book with ISBN ${isbn} checked in successfully.`,
    });
  } catch {
    response.status(500).json({
      message: `Error checking in book with ISBN ${isbn}`,
    });
  }
};

const checkOutBook = async (isbn: string, response: Response) => {
  try {
    await prisma.book.update({
      where: {
        isbn,
      },
      data: {
        isCheckedIn: false,
      },
    });
    response.status(200).json({
      message: `Book with ISBN ${isbn} checked out successfully.`,
    });
  } catch (error) {
    response.status(500).json({
      message: `Error checking out book with ISBN ${isbn}`,
    });
  }
};

const deleteBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    await prisma.book.delete({
      where: {
        isbn,
      },
    });

    response
      .status(200)
      .json({ message: `Book with ISBN ${isbn} deleted successfully.` });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Error deleting book with ISBN ${isbn}.` });
  }
};

export { addBook, deleteBook, searchBook, updateBook };
