import { Book } from "@prisma/client";

enum BookAction {
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

type BookEvent = {
  action: BookAction;
  book: Book;
};

export { BookAction, BookEvent };
