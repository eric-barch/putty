import { postBook } from "./apiRequests.js";

const closePopup = () => {
  const popup = document.getElementById("popupOverlay");

  if (popup) {
    popup.remove();
  }
};

const openPopup = async (book) => {
  const response = await fetch("/html/home/popup.html");
  const popupHtml = await response.text();

  /** Create a DOM node from the fetched HTML string. */
  const parser = new DOMParser();
  const doc = parser.parseFromString(popupHtml, "text/html");
  const popupNode = doc.body.firstChild;

  /** Set content of elements within the popup. */
  popupNode
    .querySelector("#popupCloseButton")
    .addEventListener("click", () => closePopup());
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

export { closePopup, openPopup };
