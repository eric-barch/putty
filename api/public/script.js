const dbListener = () => {
  const bookList = document.getElementById("book-list");

  async function fetchBooks() {
    const response = await fetch("/api/v1/books");
    const books = await response.json();

    bookList.innerHTML = books
      .map((book) => `<tr><td>${book.title}</td><td>${book.dewey}<td></tr>`)
      .join("");
  }

  const eventSource = new EventSource("/events");

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.action === "update") {
      fetchBooks();
    }
  };

  console.log("Call fetchBooks.");
  fetchBooks();
};

document.addEventListener("DOMContentLoaded", dbListener);
