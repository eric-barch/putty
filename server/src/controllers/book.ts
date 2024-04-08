import axios from "axios";
import { Book, PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { sendBookEvent } from "./events";

const prisma = new PrismaClient();

const getAllBooks = async (request: Request, response: Response) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        deweyClassification: "asc",
      },
    });

    response.status(200).json(books);
  } catch (error) {
    response.status(500).json({ error: "Failed to get all books." });
  }
};

const getBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const book = await getBookFromDb(isbn);
    response.status(200).json({ source: "db", book });
  } catch (error) {
    try {
      const book = await getBookFromGoogleBooks(isbn);
      response.status(200).json({ source: "googleBooks", book });
    } catch {
      response
        .status(500)
        .json({ message: `Failed to get book with ISBN ${isbn}` });
    }
  }
};

const getBookFromDb = async (isbn: string) => {
  return await prisma.book.findFirstOrThrow({
    where: {
      OR: [{ isbn10: isbn }, { isbn13: isbn }],
    },
  });
};

const getBookFromGoogleBooks = async (isbn: string) => {
  const url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`;
  const response = await axios.get(url);
  return response.data.items[0].volumeInfo;
};

const addBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    const googleBook = await getBookFromGoogleBooks(isbn);

    const {
      title,
      subtitle,
      authors,
      publishedDate,
      description,
      industryIdentifiers,
      imageLinks,
    } = googleBook;

    const isbn_10 = industryIdentifiers.find(
      (industryIdentifier: any) => industryIdentifier.type === "ISBN_10",
    )?.identifier;
    const isbn_13 = industryIdentifiers.find(
      (industryIdentifier: any) => industryIdentifier.type === "ISBN_13",
    )?.identifier;

    const authorsString = authors.join(", ");

    const thumbnail = imageLinks?.thumbnail;

    const book = await prisma.book.create({
      data: {
        title,
        subtitle,
        authors: authorsString,
        publishedDate: new Date(publishedDate),
        description,
        scannedIsbn: isbn,
        isbn10: isbn_10,
        isbn13: isbn_13,
        thumbnail,
        isCheckedIn: true,
      },
    });

    response.status(201).json(book);

    sendBookEvent({ isbn });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to add book with ISBN ${isbn}` });
  }
};

const updateBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;
  const data = request.body;

  try {
    let book: Book | undefined;

    if (isbn.length === 10) {
      book = await prisma.book.update({
        where: {
          isbn10: isbn,
        },
        data,
      });
    } else if (isbn.length === 13) {
      book = await prisma.book.update({
        where: {
          isbn13: isbn,
        },
        data,
      });
    }

    response.status(200).json(book);

    sendBookEvent({ isbn });
  } catch {
    response.status(500).json({
      message: `Failed to update book with ISBN ${isbn}.`,
    });
  }
};

const deleteBook = async (request: Request, response: Response) => {
  const { isbn } = request.params;

  try {
    if (isbn.length === 10) {
      await prisma.book.delete({
        where: {
          isbn10: isbn,
        },
      });
    } else if (isbn.length === 13) {
      await prisma.book.delete({
        where: {
          isbn13: isbn,
        },
      });
    }

    response.status(200).json({ message: `Deleted book with ISBN ${isbn}.` });

    sendBookEvent({ isbn });
  } catch (error) {
    response
      .status(500)
      .json({ message: `Failed to delete book with ISBN ${isbn}.` });
  }
};

export { addBook, deleteBook, getAllBooks, getBook, updateBook };
