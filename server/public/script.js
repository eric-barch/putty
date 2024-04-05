const dbListener = () => {
  const bookList = document.getElementById("book-list");

  const getAllBooks = async () => {
    const response = await fetch("/api/v1/book");
    const books = await response.json();

    bookList.innerHTML =
      "<tr><td>Title</td><td>Dewey Decimal Classification</td></tr>" +
      books
        .map(
          (book) =>
            `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}<td></tr>`,
        )
        .join("");
  };

  const addBook = async (book) => {
    const bookRows = bookList.querySelectorAll("tr[data-isbn]");

    let inserted = false;

    for (const bookRow of bookRows) {
      const dewey = bookRow.cells[1].textContent;

      if (book.dewey < dewey) {
        bookRow.insertAdjacentHTML(
          "beforebegin",
          `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}</td></tr>`,
        );
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      bookList.insertAdjacentHTML(
        "beforeend",
        `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}</td></tr>`,
      );
    }
  };

  const updateBook = async (book) => {
    console.error("Implement updateBook");
    throw new Error("Implement updateBook");
  };

  const deleteBook = async (book) => {
    console.error("Implement deleteBook()");
    throw new Error("Implement deleteBook()");
  };

  const eventSource = new EventSource("/api/v1/book-events");

  eventSource.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    const { isbn } = data;
    const response = await fetch(`/api/v1/book/${isbn}`);
    const book = await response.json();

    if (book) {
      try {
        await updateBook(book);
      } catch {
        await addBook(book);
      }
    } else {
      await deleteBook(book);
    }
  };

  getAllBooks();
};

document.addEventListener("DOMContentLoaded", dbListener);
