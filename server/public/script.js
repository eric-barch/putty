const dbListener = () => {
  const bookList = document.getElementById("book-list");

  const getAllBooks = async () => {
    const response = await fetch("/api/v1/book");
    const books = await response.json();

    bookList.innerHTML =
      "<tr><th>Title</th><th>Dewey Decimal Classification</th></tr>" +
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
    const bookRow = bookList.querySelector(`tr[data-isbn="${book.isbn}"]`);

    if (!bookRow) {
      console.error(`Book with ISBN ${isbn} does not exist in book-list.`);
      throw new Error(`Book with ISBN ${isbn} does not exist in book-list.`);
    }

    if (bookRow.cells[1].textContent !== book.dewey) {
      bookRow.remove();
      await addBook(book);
    } else {
      // Dewey number hasn't changed. No need to re-sort.
      bookRow.cells[0].textContent = book.title;
      bookRow.cells[1].textContent = book.dewey;
    }
  };

  const deleteBook = async (isbn) => {
    const bookRow = bookList.querySelector(`tr[data-isbn="${isbn}"]`);
    bookRow.remove();
  };

  const eventSource = new EventSource("/api/v1/book-events");

  eventSource.onmessage = async (event) => {
    const { isbn } = JSON.parse(event.data);
    console.log("isbn", isbn);

    const response = await fetch(`/api/v1/book/${isbn}`);
    const { book, source } = await response.json();

    console.log({ source, book });

    if (source === "db") {
      try {
        await updateBook(book);
      } catch {
        await addBook(book);
      }
    } else {
      console.log("delete book");
      await deleteBook(isbn);
    }
  };

  getAllBooks();
};

document.addEventListener("DOMContentLoaded", dbListener);
