const dbListener = () => {
  const bookTableBody = document.getElementById("bookTableBody");
  const bookRowTemplate = document.getElementById("bookRowTemplate");

  const getAllBooks = async () => {
    const response = await fetch("/api/v1/book");
    const books = await response.json();

    books.forEach((book) => {
      const newBookRow = createNewBookRow(book);
      bookTableBody.appendChild(newBookRow);
    });
  };

  const createNewBookRow = (book) => {
    const isbn = book.isbn13 || book.isbn10;

    const newBookRow = document
      .importNode(bookRowTemplate.content, true)
      .querySelector("tr");

    newBookRow.setAttribute("data-isbn", isbn);

    const cells = newBookRow.querySelectorAll("td");

    cells.forEach((cell) => {
      const className = cell.className;
      const value = book[className];

      if (className === "thumbnail") {
        const img = document.createElement("img");
        img.src = value;
        img.alt = `Book cover for ${book.title}`;
        cell.textContent = "";
        cell.appendChild(img);
      } else if (className === "lcClassification") {
        const lcClassification = `${book.lcClass || ""}${book.lcTopic || ""} ${book.lcSubjectCutter || ""} ${book.lcAuthorCutter || ""}`;
        cell.textContent = lcClassification;
      } else {
        cell.textContent = value;
      }
    });

    return newBookRow;
  };

  const addBook = async (book) => {
    const bookRows = bookTableBody.querySelectorAll("tr[data-isbn]");
    const newBookRow = createNewBookRow(book);

    for (const bookRow of bookRows) {
      const dewey = bookRow.querySelector(".dewey")?.textContent;

      if (book.dewey < dewey) {
        bookRow.before(newBookRow);
        return;
      }
    }

    bookTableBody.appendChild(newBookRow);
  };

  const updateBook = async (book) => {
    const isbn = book.isbn13 || book.isbn10;

    const bookRow = bookTableBody.querySelector(`tr[data-isbn="${isbn}"]`);

    if (!bookRow) {
      console.error(`Did not find book with ISBN ${isbn}.`);
      throw new Error(`Did not find book with ISBN ${isbn}.`);
    }

    if (
      bookRow.querySelector(".deweyClassification").textContent !==
      book.deweyClassification
    ) {
      bookRow.remove();
      await addBook(book);
    } else {
      /**Dewey number hasn't changed. No need to re-sort. */
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

const formListener = () => {
  const searchBookForm = document.getElementById("searchBookForm");
  const searchBookInput = document.getElementById("searchBookInput");

  searchBookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const isbn = searchBookInput.value;
    searchBookInput.value = "";

    await fetch(`/api/v1/book/${isbn}`, {
      method: "PUT",
    });
  });
};

document.addEventListener("DOMContentLoaded", dbListener);
document.addEventListener("DOMContentLoaded", formListener);
