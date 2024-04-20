const getAllBooks = async () => {
  console.log("getAllBooks");

  const response = await fetch(`/api/book`, {
    method: "GET",
  });

  const responseBooks = await response.json();

  /**console.log("responseBooks", responseBooks); */

  return responseBooks;
};

const postBook = async (requestBook) => {
  console.log("postBook", requestBook);

  const response = await fetch(`/api/book/${isbn}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBook),
  });

  const responseBook = await response.json();

  console.log("responseBook", responseBook);

  return responseBook;
};

const getBook = async (isbn) => {
  console.log("getBook", isbn);

  const response = await fetch(`/api/book/${isbn}`, {
    method: "GET",
  });

  const responseBook = await response.json();

  console.log("responseBook", responseBook);

  return responseBook;
};

const putBook = async (requestBook) => {
  console.log("putBook", requestBook);

  const response = await fetch(`/api/book/${isbn}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBook),
  });

  const responseBook = await response.json();

  console.log("responseBook", responseBook);

  return responseBook;
};

const deleteBook = async (isbn) => {
  console.log("deleteBook", isbn);

  const response = await fetch(`/api/book/${isbn}`, {
    method: "DELETE",
  });

  const responseBook = await response.json();

  console.log("responseBook", responseBook);

  return responseBook;
};

export { getAllBooks, postBook, getBook, putBook, deleteBook };
