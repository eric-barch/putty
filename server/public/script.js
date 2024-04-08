const dbListener = () => {
  const bookTableBody = document.getElementById("bookTableBody");
  const bookRowTemplate = document.getElementById("bookRowTemplate");

  const createNewBookRow = (book) => {
    const newBookRow = document
      .importNode(bookRowTemplate.content, true)
      .querySelector("tr");

    Object.entries(book).forEach(([key, value]) => {
      const element = newBookRow.querySelector(`.${key}`);
      if (element) {
        element.textContent = value;
      }
    });

    return newBookRow;
  };

  const getAllBooks = async () => {
    const response = await fetch("/api/v1/book");
    const books = await response.json();

    books.forEach((book) => {
      const newBookRow = createNewBookRow(book);
      bookTableBody.appendChild(newBookRow);
    });
  };

  const addBook = async (book) => {
    const bookRows = bookTableBody.querySelectorAll("tr[data-isbn]");
    const newBookRow = createNewBookRow(book);

    for (const bookRow of bookRows) {
      const dewey = bookRow.querySelector(".dewey").textContent;

      if (book.dewey < dewey) {
        bookRow.before(newBookRow);
        return;
      }
    }

    bookTableBody.appendChild(newBookRow);
  };

  const updateBook = async (book) => {
    const bookRow = bookTableBody.querySelector(`tr[data-isbn="${book.isbn}"]`);

    if (!bookRow) {
      console.error(`Did not find book with ISBN ${isbn}.`);
      throw new Error(`Did not find book with ISBN ${isbn}.`);
    }

    if (bookRow.querySelector(".dewey").textContent !== book.dewey) {
      bookRow.remove();
      await addBook(book);
    } else {
      // Dewey number hasn't changed. No need to re-sort.
      const newBookRow = createNewBookRow(book);
      bookRow.replaceWith(newBookRow);
    }
  };

  const deleteBook = async (isbn) => {
    const bookRow = bookTableBody.querySelector(`tr[data-isbn="${isbn}"]`);
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
