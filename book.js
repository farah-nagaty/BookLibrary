//author is a function constructor too
function Author(name, email) {
    this.name = name || "";
    this.email = email || "";
}

Author.prototype.display = function() {
    return `Author: ${this.name} (${this.email})`;
};

//function constructor to create a book object
function Book(name, price, author) {
    this.name = name || "";
    this.price = price || 0;
    this.author = author || new Author();  // Changed from authorName to author to store Author object
}

Book.prototype.display = function() {
    return `${this.name} - $${this.price} by ${this.author.display()}`;
};

var bookLibrary = [];
var booksToEnter = 0;
var currentBookCount = 0;

var ok = document.getElementById("ok");
var books = document.getElementById("books");
var booksErrorMsg = document.getElementById("booksErrorMsg");
var bookCountUI = document.getElementById("bookCountUI");

var form = document.getElementById("form");

var book_name = document.getElementById("book_name");
var price = document.getElementById("price");
var AuthName = document.getElementById("AuthName");
var email = document.getElementById("email");
var add = document.getElementById("Add");

var formTitle = document.createElement("h2");
form.insertBefore(formTitle, form.firstChild);

var bNameErrorMsg = document.getElementById("bNameErrorMsg");
var priceErrorMsg = document.getElementById("priceErrorMsg");
var AuthNameErrorMsg = document.getElementById("AuthNameErrorMsg");
var emailErrorMsg = document.getElementById("emailErrorMsg");

ok.addEventListener("click", function validNumOfBooks(eventObj) {
    eventObj.preventDefault();
    booksErrorMsg.innerHTML = "";

    if (books.value === "") {
        booksErrorMsg.innerHTML = "books number is required";
        return;
    }
    
    if (isNaN(books.value)) {
        booksErrorMsg.innerHTML = "Please enter a valid number";
        return;
    }
    
    if (books.value <= 0) {
        booksErrorMsg.innerHTML = "Please enter a positive number";
        return;
    }
    
    booksToEnter = parseInt(books.value);
    currentBookCount = 1;
    bookCountUI.style.display = "none";
    form.style.display = "block";
    formTitle.textContent = `Enter Book ${currentBookCount} of ${booksToEnter}`;
});

add.addEventListener("click", function validForm(eventObj) {
    eventObj.preventDefault();

    // Validate form - make sure it returns false if invalid
    if (validateForm() === false) return;

    var newAuthor = new Author(AuthName.value.trim(), email.value.trim());
    var newBook = new Book(
        book_name.value.trim(),
        parseFloat(price.value),
        newAuthor
    );

    bookLibrary.push(newBook);
    form.reset();
    currentBookCount++;

    if (currentBookCount > booksToEnter) {
        form.style.display = "none";
        displayBooksTable();
    } else {
        formTitle.textContent = `Enter Book ${currentBookCount} of ${booksToEnter}`;
    }
});

function validateForm() {
    // Reset errors
    document.querySelectorAll('[id$="ErrorMsg"]').forEach(el => el.innerHTML = "");

    let isValid = true;

    // Book name validation
    if (book_name.value.trim() === "") {
        bNameErrorMsg.innerHTML = "book name is required";
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(book_name.value)) {
        bNameErrorMsg.innerHTML = "book name should contain only letters and spaces";
        isValid = false;
    } else if (book_name.value.length < 3) {
        bNameErrorMsg.innerHTML = "book name must be at least 3 characters";
        isValid = false;
    }

    // Price validation
    if (price.value === "") {
        priceErrorMsg.innerHTML = "Price is required";
        isValid = false;
    } else if (isNaN(price.value)) {
        priceErrorMsg.innerHTML = "Price must be a number";
        isValid = false;
    } else if (parseFloat(price.value) < 0) {
        priceErrorMsg.innerHTML = "Price cannot be negative";
        isValid = false;
    }

    // Author validation
    if (AuthName.value.trim() === "") {
        AuthNameErrorMsg.innerHTML = "Author name is required";
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(AuthName.value)) {
        AuthNameErrorMsg.innerHTML = "Author name should contain only letters and spaces";
        isValid = false;
    } else if (AuthName.value.length < 3) {
        AuthNameErrorMsg.innerHTML = "Author name must be at least 3 characters";
        isValid = false;
    }

    // Email validation
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.value.trim() === "") {
        emailErrorMsg.innerHTML = "Email is required";
        isValid = false;
    } else if (!regex.test(email.value.trim())) {
        emailErrorMsg.innerHTML = "Please enter a valid email (example@domain.com)";
        isValid = false;
    }

    return isValid;
}

function displayBooksTable() {
    // Check if table already exists
    let tableContainer = document.getElementById("tableContainer");
    
    // If doesn't exist, create it
    if (!tableContainer) {
        tableContainer = document.createElement("div");
        tableContainer.id = "tableContainer";
        tableContainer.innerHTML = `
            <h2>Book Library</h2>
            <table id="booksTable" border="1">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Book Name</th>
                        <th>Price</th>
                        <th>Author</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="booksTableBody"></tbody>
            </table>
            <div id="editErrors" style="color: red;"></div>
        `;
        document.body.appendChild(tableContainer);
    }
    
    // Always update the table content
    updateBooksTable();
}

function updateBooksTable() {
    const tbody = document.getElementById("booksTableBody");
    
    // Clear existing rows
    tbody.innerHTML = "";

    // Add rows for each book
    bookLibrary.forEach((book, index) => {
        const row = document.createElement("tr");
        row.dataset.index = index;
        row.innerHTML = `
            <td>${index + 1}</td>
            <td class="book-name">${book.name}</td>
            <td class="book-price">$${book.price.toFixed(2)}</td>
            <td class="author-name">${book.author.name}</td>
            <td class="author-email">${book.author.email}</td>
            <td>
                <button class="edit-btn">Edit</button>
                <button class="delete-btn">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    // Add event listeners
    attachTableEventListeners();
}

function attachTableEventListeners() {
    document.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", handleEdit);
    });
    document.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", handleDelete);
    });
}

function handleEdit(e) {
    var row = e.target.closest("tr");
    var index = row.dataset.index;
    var book = bookLibrary[index];

    // Clear any previous error messages
    clearEditErrors();

    // Make row editable
    row.innerHTML = `
        <td>${parseInt(index) + 1}</td>
        <td><input type="text" class="edit-name" value="${book.name}"></td>
        <td><input type="number" class="edit-price" value="${book.price}" step="0.01"></td>
        <td><input type="text" class="edit-author" value="${book.author.name}"></td>
        <td><input type="email" class="edit-email" value="${book.author.email}"></td>
        <td>
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        </td>
    `;

    // Add event listeners to new buttons
    row.querySelector(".save-btn").addEventListener("click", () => saveEdit(index));
    row.querySelector(".cancel-btn").addEventListener("click", () => {
        clearEditErrors(); // Clear errors when canceling
        updateBooksTable(); // Refresh the table
    });
}

function clearEditErrors() {
    const editErrors = document.getElementById("editErrors");
    if (editErrors) {
        editErrors.innerHTML = "";
    }
}

function validateEditForm(bookName, price, authorName, email) {
    const editErrors = document.getElementById("editErrors");
    editErrors.innerHTML = "";
    let isValid = true;

    // Book name validation
    if (bookName.trim() === "") {
        editErrors.innerHTML += "<p>Book name is required</p>";
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(bookName)) {
        editErrors.innerHTML += "<p>Book name should contain only letters and spaces</p>";
        isValid = false;
    } else if (bookName.length < 3) {
        editErrors.innerHTML += "<p>Book name must be at least 3 characters</p>";
        isValid = false;
    }

    // Price validation
    if (isNaN(price)) {
        editErrors.innerHTML += "<p>Price must be a number</p>";
        isValid = false;
    } else if (price < 0) {
        editErrors.innerHTML += "<p>Price cannot be negative</p>";
        isValid = false;
    }

    // Author validation
    if (authorName.trim() === "") {
        editErrors.innerHTML += "<p>Author name is required</p>";
        isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(authorName)) {
        editErrors.innerHTML += "<p>Author name should contain only letters and spaces</p>";
        isValid = false;
    } else if (authorName.length < 3) {
        editErrors.innerHTML += "<p>Author name must be at least 3 characters</p>";
        isValid = false;
    }

    // Email validation
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email.trim() === "") {
        editErrors.innerHTML += "<p>Email is required</p>";
        isValid = false;
    } else if (!regex.test(email.trim())) {
        editErrors.innerHTML += "<p>Please enter a valid email (example@domain.com)</p>";
        isValid = false;
    }

    return isValid;
}

function saveEdit(index) {
    var row = document.querySelector(`tr[data-index="${index}"]`);
    var book = bookLibrary[index];

    // Get edited values
    var newName = row.querySelector(".edit-name").value;
    var newPrice = parseFloat(row.querySelector(".edit-price").value);
    var newAuthorName = row.querySelector(".edit-author").value;
    var newEmail = row.querySelector(".edit-email").value;

    // Validate inputs using the same validation as the form
    if (!validateEditForm(newName, newPrice, newAuthorName, newEmail)) {
        return;
    }

    // Update book object
    book.name = newName.trim();
    book.price = newPrice;
    book.author.name = newAuthorName.trim();
    book.author.email = newEmail.trim();

    // Refresh table
    updateBooksTable();
}

function handleDelete(e) {
    var index = e.target.closest("tr").dataset.index;
    if (confirm("Are you sure you want to delete this book?")) {
        bookLibrary.splice(index, 1);
        updateBooksTable();
        
        // If all books are deleted, show the initial UI
        if (bookLibrary.length === 0) {
            document.getElementById("tableContainer").remove();
            bookCountUI.style.display = "block";
            books.value = "";
        }
    }
}