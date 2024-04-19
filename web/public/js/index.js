import { getHighlightedBookRow, setHighlightedBookRow } from "./global.js";

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

const createBookRow = (book) => {
  const bookRow = document
    .importNode(bookRowTemplate.content, true)
    .querySelector("tr");

  bookRow.setAttribute("data-isbn", book.scannedIsbn);

  const cells = bookRow.querySelectorAll("td");

  cells.forEach((cell) => {
    const className = cell.className;
    const value = book[className];

    switch (className) {
      case "thumbnail":
        const img = document.createElement("img");
        img.src = value;
        img.alt = `Book cover for ${book.title}`;
        cell.textContent = "";
        cell.appendChild(img);
        break;
      case "title":
        const a = document.createElement("a");
        a.href = "javascript:void(0)";
        a.textContent = book.title;
        cell.appendChild(a);
        break;
      case "lcClassification":
        const lcClassification = `${book.lcClass || ""}${book.lcTopic || ""} ${book.lcSubjectCutter || ""} ${book.lcAuthorCutter || ""}`;
        cell.textContent = lcClassification;
        break;
      default:
        cell.textContent = value;
    }
  });

  return bookRow;
};

const createAllBookRows = async () => {
  const bookTableBody = document.getElementById("bookTableBody");
  const books = await getAllBooks();

  books.forEach((book) => {
    const bookRow = createBookRow(book);
    bookTableBody.appendChild(bookRow);
  });
};

const postBookRow = async (isbn) => {
  const { book } = await getBook(isbn);
  const newBookRow = createBookRow(book);

  const bookRows = bookTableBody.querySelectorAll("tr[data-isbn]");

  for (const bookRow of bookRows) {
    const lcClassification =
      bookRow.querySelector(".lcClassification")?.textContent;

    if (book.lcClassification < lcClassification) {
      bookRow.before(newBookRow);
      return;
    }
  }

  bookTableBody.appendChild(newBookRow);
};

const putBookRow = async (isbn) => {
  const book = getBook(isbn);
  const bookRow = bookTableBody.querySelector(
    `tr[data-isbn="${book.scannedIsbn}"]`,
  );

  if (!bookRow) {
    console.error(`Did not find book with ISBN ${isbn}.`);
    throw new Error(`Did not find book with ISBN ${isbn}.`);
  }

  const lcClassification =
    bookRow.querySelector(".lcClassification")?.textContent;

  if (lcClassification !== book.lcClassification) {
    bookRow.remove();
    await postBookRow(isbn);
  } else {
    /**Classification hasn't changed. No need to re-sort. */
    const newBookRow = createBookRow(book);
    bookRow.replaceWith(newBookRow);
  }
};

const deleteBookRow = async (isbn) => {
  const bookRow = bookTableBody.querySelector(`tr[data-isbn="${isbn}"]`);
  bookRow.remove();
};

const openPopup = async (book) => {
  const response = await fetch("popup.html");
  const popupHtml = await response.text();

  /** Create a DOM node from the fetched HTML string. */
  const parser = new DOMParser();
  const doc = parser.parseFromString(popupHtml, "text/html");
  const popupNode = doc.body.firstChild;

  /** Set content of elements within the popup. */
  popupNode.querySelector("#popupTitle").textContent = book.details.title;
  popupNode.querySelector("#popupAuthors").textContent = book.details.authors;
  popupNode.querySelector("#popupDewey").textContent =
    `Dewey Classification: ${book.details.deweyClassification}`;
  popupNode.querySelector("#popupLoC").textContent =
    `Library of Congress Classification: ${book.details.lcClassification}`;
  popupNode.querySelector("#popupCheckedIn").textContent =
    `Checked In: ${book.details.isCheckedIn}`;

  /** Determine which buttons to add based on book source and check-in status. */
  const buttonContainer = popupNode.querySelector("#buttonContainer");
  const isInLibrary = book.source === "db";

  if (isInLibrary) {
    if (book.details.isCheckedIn) {
      const checkOutButton = document.createElement("button");
      checkOutButton.id = "checkOutButton";
      checkOutButton.textContent = "Check Out";
      buttonContainer.appendChild(checkOutButton);
    } else {
      const checkInButton = document.createElement("button");
      checkInButton.id = "checkInButton";
      checkInButton.textContent = "Check In";
      buttonContainer.appendChild(checkInButton);
    }
    const deleteButton = document.createElement("button");
    deleteButton.id = "deleteButton";
    deleteButton.textContent = "Delete from Library";
    buttonContainer.appendChild(deleteButton);
  } else {
    const postButton = document.createElement("button");
    postButton.id = "postButton";
    postButton.textContent = "Add to Library";
    buttonContainer.appendChild(postButton);
    postButton.addEventListener("click", () => postBook(book));
  }

  /** Append popup node to body and make it visible. */
  document.body.appendChild(popupNode);
  popupNode.style.display = "flex";
};

window.closePopup = () => {
  const popup = document.getElementById("popupOverlay");

  if (popup) {
    popup.remove();
  }
};

const searchBook = async (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("searchInput");

  const query = searchInput.value;

  try {
    const bookRow = document.querySelector(`tr[data-isbn="${query}"]`);

    const highlightedBookRow = getHighlightedBookRow();
    highlightedBookRow && (highlightedBookRow.style.backgroundColor = "");

    bookRow.style.backgroundColor = "lightyellow";
    bookRow.scrollIntoView({ behavior: "smooth", block: "center" });

    setHighlightedBookRow(bookRow);
  } catch {
    const book = await getBook(query);

    if (book.source === "db") {
      throw new Error(
        `Book with ISBN ${query} is in database but not displayed in table.`,
      );
    }

    openPopup(book);
  }

  searchInput.value = "";
};

const bookEventListener = () => {
  const eventSource = new EventSource(`/api/book-events`);

  eventSource.onmessage = async (event) => {
    const { isbn, action } = JSON.parse(event.data);

    switch (action) {
      case "post":
        await postBookRow(isbn);
        break;
      case "put":
        await putBookRow(isbn);
        break;
      case "delete":
        await deleteRow(isbn);
        break;
      default:
        throw new Error(`Unrecognized action: ${action}`);
    }
  };
};

const handleTitleClick = (event) => {
  let targetRow = event.target;

  while (targetRow != this && !targetRow.hasAttribute("data-isbn")) {
    targetRow = targetRow.parentNode;
  }

  if (!targetRow.hasAttribute("data-isbn")) return;

  const book = {
    title: targetRow.querySelector(".title").textContent,
    authors: targetRow.querySelector(".authors").textContent,
    deweyClassification: targetRow.querySelector(".deweyClassification")
      .textContent,
    lcClassification: targetRow.querySelector(".lcClassification").textContent,
    isCheckedIn: targetRow.querySelector(".isCheckedIn").textContent,
  };

  openPopup(book);
};

document.addEventListener("DOMContentLoaded", bookEventListener);
document.getElementById("searchForm").addEventListener("submit", searchBook);
document
  .getElementById("bookTableBody")
  .addEventListener("click", handleTitleClick);

createAllBookRows();
