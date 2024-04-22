import {
  handleCheckIn,
  handleCheckOut,
  handleDelete,
  handlePost,
} from "./eventHandlers.js";

const closePopup = () => {
  const popup = document.getElementById("popupOverlay");

  if (popup) {
    popup.remove();
  }
};

const openPopup = async (inLibrary, book) => {
  const response = await fetch("/html/home/popup.html");
  const popupHtml = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(popupHtml, "text/html");
  const popup = doc.body.firstChild;

  popup
    .querySelector("#popupCloseButton")
    .addEventListener("click", () => closePopup());
  popup.querySelector("#popupTitle").textContent = book.title;
  popup.querySelector("#popupAuthors").textContent = book.authors;
  popup.querySelector("#popupDewey").textContent =
    `Dewey Classification: ${book.deweyClassification}`;
  popup.querySelector("#popupLc").textContent =
    `LoC Classification: ${book.lcClass || ""}${book.lcTopic || ""} ${book.lcSubjectCutter || ""} ${book.lcAuthorCutter || ""}`;
  popup.querySelector("#popupCheckedIn").textContent =
    `Checked In: ${book.isCheckedIn}`;

  const buttonContainer = popup.querySelector("#popupButtonContainer");

  if (inLibrary) {
    if (book.isCheckedIn) {
      const checkOutButton = document.createElement("button");
      checkOutButton.id = "checkOutButton";
      checkOutButton.textContent = "Check Out";
      checkOutButton.addEventListener("click", () => handleCheckOut(book));
      buttonContainer.appendChild(checkOutButton);
    } else {
      const checkInButton = document.createElement("button");
      checkInButton.id = "checkInButton";
      checkInButton.textContent = "Check In";
      checkInButton.addEventListener("click", () => handleCheckIn(book));
      buttonContainer.appendChild(checkInButton);
    }
    const deleteButton = document.createElement("button");
    deleteButton.id = "deleteButton";
    deleteButton.textContent = "Delete from Library";
    deleteButton.addEventListener("click", () => handleDelete(book));
    buttonContainer.appendChild(deleteButton);
  } else {
    const postButton = document.createElement("button");
    postButton.id = "postButton";
    postButton.textContent = "Add to Library";
    postButton.addEventListener("click", () => handlePost(book));
    buttonContainer.appendChild(postButton);
  }

  document.body.appendChild(popup);
  popup.style.display = "flex";
};

export { closePopup, openPopup };
