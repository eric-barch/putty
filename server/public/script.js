const dbListener = () => {
  const bookListBody = document.getElementById("book-list-body");

  const getAllBooks = async () => {
    const response = await fetch("/api/v1/book");
    const books = await response.json();

    books.forEach((book) => {
      bookListBody.insertAdjacentHTML(
        "beforeend",
        `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}</td><td>${book.isCheckedIn}</td></tr>`,
      );
    });
  };

  const addBook = async (book) => {
    const bookRows = bookListBody.querySelectorAll("tr[data-isbn]");

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
      bookListBody.insertAdjacentHTML(
        "beforeend",
        `<tr data-isbn="${book.isbn}"><td>${book.title}</td><td>${book.dewey}</td><td>${book.isCheckedIn}</td></tr>`,
      );
    }
  };

  const updateBook = async (book) => {
    const bookRow = bookListBody.querySelector(`tr[data-isbn="${book.isbn}"]`);

    if (!bookRow) {
      console.error(`Did not find book with ISBN ${isbn}.`);
      throw new Error(`Did not find book with ISBN ${isbn}.`);
    }

    if (bookRow.cells[1].textContent !== book.dewey) {
      bookRow.remove();
      await addBook(book);
    } else {
      // Dewey number hasn't changed. No need to re-sort.
      bookRow.cells[0].textContent = book.title;
      bookRow.cells[1].textContent = book.dewey;
      bookRow.cells[2].textContent = book.isCheckedIn;
    }
  };

  const deleteBook = async (isbn) => {
    const bookRow = bookListBody.querySelector(`tr[data-isbn="${isbn}"]`);
    bookRow.remove();
  };

  const eventSource = new EventSource("/api/v1/book-events");

  eventSource.onmessage = async (event) => {
    const { isbn } = JSON.parse(event.data);
    const response = await fetch(`/api/v1/book/${isbn}`);
    const { book, source } = await response.json();

    if (source === "db") {
      /**If the book came from the database, it should either be updated in or
       * added to our displayed library. */
      try {
        await updateBook(book);
      } catch {
        await addBook(book);
      }
    } else {
      /**If the book did not come from the database, it came from the fallback
       * external API lookups. It should not be included in our displayed library. */
      await deleteBook(isbn);
    }
  };

  getAllBooks();
};

document.addEventListener("DOMContentLoaded", dbListener);
