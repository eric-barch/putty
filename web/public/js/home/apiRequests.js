const getAllBooks = async () => {
  const response = await fetch(`/api/book`, {
    method: "GET",
  });

  const responseBooks = await response.json();

  return responseBooks;
};

const postBook = async (requestBook) => {
  const response = await fetch(`/api/book`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBook),
  });

  const responseBook = await response.json();

  return responseBook;
};

const getBook = async (query) => {
  const response = await fetch(`/api/book/${query}`, {
    method: "GET",
  });

  const responseBook = await response.json();

  return responseBook;
};

const putBook = async (requestBook) => {
  const response = await fetch(`/api/book`, {
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
  const response = await fetch(`/api/book`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBook),
  });

  const responseBook = await response.json();

  return responseBook;
};

export { getAllBooks, postBook, getBook, putBook, deleteBook };
