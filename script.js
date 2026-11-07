// ==========================================
// GLOBALS & STATE
// ==========================================
let books = []; 

// ==========================================
// FEATURE 3 & 4: CLASSES (OOP)
// ==========================================
class Book {
  constructor(title, author) {
    this.title = title;
    this.author = author;
    this.id = Date.now() + Math.random(); 
    this.type = "physical";
    this.available = true;
    this.borrower = null;
  } 

  borrow(borrowerName) {
    this.borrower = borrowerName;
    this.available = false;
  } 

  markReturned() {
    this.borrower = null;
    this.available = true;
  } 
getHTML() {
  const card = document.createElement("div");
  card.className = "book-card physical-book";
  card.dataset.id = this.id; 

  // Status text ko backtick ke bahaar handle kiya taaki error ka chance hi na rahe
  const statusText = this.available ? "Available" : "Borrowed by " + this.borrower;
  
  // Action buttons ko bhi simple variable mein store kiya
  const actionButtons = this.available
    ? `<input type="text" placeholder="Borrower Name" class="borrower-input">
       <button class="borrow-btn">Borrow</button>`
    : `<button class="return-btn">Return</button>`;

  card.innerHTML = `
    <h3>${this.title}</h3>
    <p><strong>Author:</strong> ${this.author}</p>
    <p><strong>Status:</strong> ${statusText}</p>
    <div class="actions">
      ${actionButtons}
      <button class="remove-btn">Remove</button>
    </div>
  `;
  return card;
}


} 

class Ebook extends Book {
  constructor(title, author, fileSize) {
    super(title, author);
    this.type = "ebook";
    this.fileSize = fileSize;
  } 

  borrow(borrowerName) {
    this.borrower = borrowerName;
  } 

  markReturned() {
    this.borrower = null;
  } 

getHTML() {
  const card = document.createElement("div");
  card.className = "book-card ebook-book ebook"; 
  card.dataset.id = this.id; 

  // Ebook ka status text string concatenation se clear kiya
  const statusText = this.borrower ? "Downloaded by " + this.borrower : "Available";

  const actionButtons = !this.borrower
    ? `<input type="text" placeholder="Your Name" class="borrower-input">
       <button class="borrow-btn">Download</button>`
    : `<button class="return-btn">Return</button>`;

  card.innerHTML = `
    <h3>${this.title}</h3>
    <p><strong>Author:</strong> ${this.author}</p>
    <p><strong>File Size:</strong> ${this.fileSize} MB</p>
    <p><strong>Status:</strong> ${statusText}</p>
    <div class="actions">
      ${actionButtons}
      <button class="remove-btn">Remove</button>
    </div>
  `;
  return card;
}


} 

// ==========================================
// FEATURE 1 & 2: FORM INTERACTIONS & DOM SELECTORS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const addBookSection = document.querySelector(".add-book-section");
  const toggleFormBtn = document.querySelector("#toggle-form");
  const typeSelect = document.querySelector("#type");
  const ebookDetails = document.querySelector("#ebook-details");
  const bookList = document.querySelector("#book-list");
  const bookForm = document.querySelector("#book-form"); 

  if (toggleFormBtn && addBookSection) {
    toggleFormBtn.addEventListener("click", () => {
      const isHidden = addBookSection.style.display === "none" || !addBookSection.style.display;
      addBookSection.style.display = isHidden ? "block" : "none";
      toggleFormBtn.textContent = isHidden ? "Hide Form" : "Add New Book";
    });
  } 

  if (typeSelect && ebookDetails) {
    typeSelect.addEventListener("change", () => {
      ebookDetails.style.display = typeSelect.value === "ebook" ? "block" : "none";
    });
  } 

  if (bookForm) {
    bookForm.addEventListener("submit", (e) => {
      e.preventDefault(); 

      const title = document.querySelector("#title").value.trim();
      const author = document.querySelector("#author").value.trim();
      const type = typeSelect.value;

      if (!title || !author) return alert("Please fill in all standard fields.");

      let newBook;
      if (type === "ebook") {
        const fileSize = document.querySelector("#file-size").value.trim();
        if (!fileSize) return alert("Please enter a file size for the e-book.");
        newBook = new Ebook(title, author, fileSize);
      } else {
        newBook = new Book(title, author);
      }

      books.push(newBook);
      saveBooks();
      displayBooks();
      bookForm.reset();
      if (ebookDetails) ebookDetails.style.display = "none";
    });
  } 

  if (bookList) {
    bookList.addEventListener("click", (e) => {
      const target = e.target;
      const card = target.closest(".book-card");
      if (!card) return; 

      const targetId = parseFloat(card.dataset.id);
      const bookIndex = books.findIndex(b => b.id === targetId);
      if (bookIndex === -1) return;

      const currentBook = books[bookIndex];

      if (target.classList.contains("borrow-btn")) {
        const input = card.querySelector(".borrower-input");
        const borrowerName = input ? input.value.trim() : "";
        if (!borrowerName) return alert("Please enter a borrower name.");
        currentBook.borrow(borrowerName);
        saveBooks();
        displayBooks();
      }

      if (target.classList.contains("return-btn")) {
        currentBook.markReturned();
        saveBooks();
        displayBooks();
      }

      if (target.classList.contains("remove-btn")) {
        books.splice(bookIndex, 1);
        saveBooks();
        displayBooks();
      }
    });
  } 

  // Single cleanly bound lifecycle load operation
  loadBooks();
}); 

// ==========================================
// FEATURE 5, 6 & 7: DISPLAY BOOKS UI
// ==========================================
function displayBooks() {
  const bookList = document.querySelector("#book-list");
  if (!bookList) return; 

  bookList.innerHTML = ""; 

  if (books.length === 0) {
    bookList.innerHTML = "<p>No Books Found</p>";
    return;
  } 
  
  books.forEach(book => {
    bookList.appendChild(book.getHTML());
  });
}

// ==========================================
// FEATURE 8: LOCALSTORAGE PERSISTENCE & RE-HYDRATION
// ==========================================
function saveBooks() {
  localStorage.setItem("booksArray", JSON.stringify(books));
}

function loadBooks() {
  const data = localStorage.getItem("booksArray");
  if (!data) {
    books = [];
    displayBooks();
    return;
  }

  try {
    const bookObjects = JSON.parse(data);
    
    books = bookObjects.map(obj => {
      let instance;
      if (obj.type === "ebook") {
        instance = new Ebook(obj.title, obj.author, obj.fileSize);
      } else {
        instance = new Book(obj.title, obj.author);
      }
      instance.id = obj.id;
      instance.available = obj.available;
      instance.borrower = obj.borrower;
      return instance;
    });

  } catch (error) {
    console.error("Failed to parse books from storage:", error);
    books = [];
  }

  displayBooks(); 
}

