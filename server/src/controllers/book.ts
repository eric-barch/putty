import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendBookEvent } from "./events";

const prisma = new PrismaClient();

const getAllBooks = async (request: Request, response: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        dewey: "asc",
      },
    });

    response.json(books);
  } catch (error) {
    response.status(500).json({ error: "Failed to get all books." });
  }
};

const searchBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const book = await searchDb(isbn);
    response.json(book);
  } catch (error) {
    try {
      const book = await searchOpenLibrary(isbn);
      response.json(book);
    } catch {
      response
        .status(500)
        .json({ message: `Failed to search for book with ISBN ${isbn}` });
    }
  }
};

const searchDb = async (isbn: string) => {
  return await prisma.book.findUniqueOrThrow({
    where: { isbn },
  });
};

const searchOpenLibrary = async (isbn: string) => {
  const openLibraryUrl = `https://openlibrary.org/isbn/${isbn}.json`;

  try {
    const response = await axios.get(openLibraryUrl);
    return response.data;
  } catch (error) {
    throw new Error("Failed to get book from Open Library");
  }
};

const addBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const { title, subtitle, lccn, dewey_decimal_class } =
      await searchOpenLibrary(isbn);
    const firstLccn = lccn?.[0];
    const firstDewey = dewey_decimal_class?.[0];

    const book = await prisma.book.create({
      data: {
        isbn,
        isCheckedIn: true,
        title,
        subtitle,
        lccn: firstLccn,
        dewey: firstDewey,
      },
    });

    response
      .status(201)
      .json({ message: `Added book with ISBN ${isbn}`, book });

    console.log("Sending event", isbn);
    sendBookEvent({ isbn });
  } catch {
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
      message: `Checked in book with ISBN ${isbn}.`,
    });

    sendBookEvent({ action: "update" });
  } catch {
    response.status(500).json({
      message: `Failed to check in book with ISBN ${isbn}.`,
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
      message: `Checked out book with ISBN ${isbn}.`,
    });

    sendBookEvent({ action: "update" });
  } catch (error) {
    response.status(500).json({
      message: `Failed to check out book with ISBN ${isbn}.`,
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

    console.log("foo");

    response.status(200).json({ message: `Deleted book with ISBN ${isbn}.` });

    console.log("delete book");
    sendBookEvent({ action: "update" });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to delete book with ISBN ${isbn}.` });
  }
};

export { addBook, deleteBook, getAllBooks, searchBook, updateBook };
