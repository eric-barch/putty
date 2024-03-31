import axios from "axios";
import { Request, Response } from "express";

const lookUpBook = async (req: Request, res: Response) => {
  const isbn = req.params.isbn;
  const openLibraryUrl = `https://openlibrary.org/isbn/${isbn}`;

  try {
    const openLibraryResponse = await axios.get(openLibraryUrl);
    res.send(openLibraryResponse.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      res.status(error.response?.status || 500).send(error.message);
    } else {
      res.status(500).send("An unknown error occurred.");
    }
  }
};

export { lookUpBook };
