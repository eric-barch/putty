import { getHighlightedBookRow, setHighlightedBookRow } from "./global.js";

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

  const response = await fetch(`/api/book`, { method: "GET" });
  const books = await response.json();

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

const showPopup = (book) => {
  document.getElementById("popupTitle").textContent = book.title;
  document.getElementById("popupAuthors").textContent = book.authors;
  document.getElementById("popupDewey").textContent =
    `Dewey Classification: ${book.deweyClassification}`;
  document.getElementById("popupLoC").textContent =
    `Library of Congress Classification: ${book.lcClassification}`;
  document.getElementById("popupCheckedIn").textContent =
    `Checked In: ${book.isCheckedIn}`;
  document.getElementById("popupOverlay").style.display = "flex";
};

window.closePopup = function () {
  document.getElementById("popupOverlay").style.display = "none";
};

const searchBook = async (event) => {
  event.preventDefault();
  const searchInput = document.getElementById("searchInput");

  const isbn = searchInput.value;

  try {
    const bookRow = document.querySelector(`tr[data-isbn="${isbn}"]`);

    const highlightedBookRow = getHighlightedBookRow();
    highlightedBookRow && (highlightedBookRow.style.backgroundColor = "");

    bookRow.style.backgroundColor = "lightyellow";
    bookRow.scrollIntoView({ behavior: "smooth", block: "center" });

    setHighlightedBookRow(bookRow);
  } catch {
    const book = await getBook(isbn);

    if (book.source === "db") {
      throw new Error(
        `Book with ISBN ${isbn} is in database but not displayed in table.`,
      );
    }

    showPopup(book.book);
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

  showPopup(book);
};

createAllBookRows();
document.addEventListener("DOMContentLoaded", bookEventListener);
document.getElementById("searchForm").addEventListener("submit", searchBook);
document
  .getElementById("bookTableBody")
  .addEventListener("click", handleTitleClick);
