const getAllBooks = async () => {
  const response = await fetch(`/api/book`, {
    method: "GET",
  });

  const responseBooks = await response.json();

  return responseBooks;
};

const postBook = async (requestBook) => {
  const isbn = requestBook.isbn13 || requestBook.isbn10;

  const response = await fetch(`/api/book/${isbn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBook),
  });

  const responseBook = await response.json();

  return responseBook;
};

const getBook = async (isbn) => {
  const response = await fetch(`/api/book/${isbn}`, {
    method: "GET",
  });

  const responseBook = await response.json();

  return responseBook;
};

const putBook = async (requestBook) => {
  const response = await fetch(`/api/book/${isbn}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBook),
  });

  const responseBook = await response.json();

  return responseBook;
};

const deleteBook = async (requestBook) => {
  const isbn = requestBook.isbn13 || requestBook.isbn10;

  const response = await fetch(`/api/book/${isbn}`, {
    method: "DELETE",
  });

  const responseBook = await response.json();

  return responseBook;
};

export { getAllBooks, postBook, getBook, putBook, deleteBook };
