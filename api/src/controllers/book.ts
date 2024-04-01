import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { Request, Response } from "express";

const prisma = new PrismaClient();

const lookUpBook = async (request: Request, response: Response) => {
  lookUpBookInDb(request, response)
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (error) => {
      console.error(error);
      await prisma.$disconnect();
      await lookUpBookOnOpenLibrary(request, response);
    });
};

const lookUpBookInDb = async (request: Request, response: Response) => {
  const allBooks = await prisma.book.findMany();
  console.log("allBooks", allBooks);
};

const lookUpBookOnOpenLibrary = async (
  request: Request,
  response: Response,
) => {
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

export { lookUpBook };
