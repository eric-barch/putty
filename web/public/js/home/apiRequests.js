const getAllBooks = async () => {
  const response = await fetch(`/api/book`, {
    method: "GET",
  });

  const books = await response.json();

  return books;
};

const postBook = async (book) => {
  const isbn = book.details.isbn13 || book.details.isbn10;

  await fetch(`/api/book/${isbn}`, {
    method: "POST",
  });
};

const getBook = async (isbn) => {
  const response = await fetch(`/api/book/${isbn}`, {
    method: "GET",
  });

  const book = await response.json();

  return book;
};

export { getAllBooks, postBook, getBook };
