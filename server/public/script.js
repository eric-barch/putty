const dbListener = () => {
  const bookList = document.getElementById("book-list");

  const getAllBooks = async () => {
    const response = await fetch("/api/v1/book");
    const books = await response.json();

    bookList.innerHTML =
      "<tr><th>Title</th><th>Dewey Decimal Classification</th><th>Checked In</th></tr>" +
      books
        .map(
          (book) =>
            `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}<td><td>${book.isCheckedIn}</td></tr>`,
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
          `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}</td><td>${book.isCheckedIn}</td></tr>`,
        );
        inserted = true;
        break;
      }
    }

    if (!inserted) {
      bookList.insertAdjacentHTML(
        "beforeend",
        `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}</td><td>${book.isCheckedIn}</td></tr>`,
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
      bookRow.cells[3].textContent = book.isCheckedIn;
    }
  };

  const deleteBook = async (isbn) => {
    const bookRow = bookList.querySelector(`tr[data-isbn="${isbn}"]`);
    bookRow.remove();
  };

  const eventSource = new EventSource("/api/v1/book-events");

  eventSource.onmessage = async (event) => {
    const { isbn } = JSON.parse(event.data);
    const response = await fetch(`/api/v1/book/${isbn}`);
    const { book, source } = await response.json();

    if (source === "db") {
      try {
        await updateBook(book);
      } catch {
        await addBook(book);
      }
    } else {
      await deleteBook(isbn);
    }
  };

  getAllBooks();
};

document.addEventListener("DOMContentLoaded", dbListener);
