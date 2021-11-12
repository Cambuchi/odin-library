class Book {
    constructor(title, author, pages, read, imgUrl) {
        this.title = title; 
        this.author = author;
        this.pages = pages;
        this.imgLink = imgUrl;
    
        if (read === "yes") {
            this.read = "Status: Read";
        } else {
            this.read = "Status: Not Read"
        }
    }

    get current() {
        return this.read;
    }

    set current(status) {
        if (status === "yes") {
            this.read = "Status: Read";
        } else {
            this.read = "Status: Not Read"
        }
    }
}


function Book(title, author, pages, read, imgUrl) {
    this.title = title; 
    this.author = author;
    this.pages = pages;
    this.imgLink = imgUrl;

    if (read === "yes") {
        this.read = "Status: Read";
    } else {
        this.read = "Status: Not Read"
    }
};

function addBookToLibrary(book) {
  myLibrary.push(book);
  localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
}

function displayAllBooks() {
    document.querySelector('#library').innerHTML = "";
    for (i = 0; i < myLibrary.length; i++) {
        displayBook(myLibrary[i], i);
    };
    addReadBtns();
    addRemoveBtns();
};

function invalid(event) {
    error.removeAttribute('hidden');
};
  
function submit(event) {
    newBook()
    form.reset();
    error.setAttribute('hidden', '');
    event.preventDefault();
};

function displayBook(book, index) {
    const library = document.querySelector('#library')
    const item = document.createElement(`div`);
    const button = document.createElement('button')
    const readBtn = document.createElement('button');
    button.textContent = 'Remove Book';
    button.classList.add(`remove-btn`);
    button.dataset.index = index;
    readBtn.textContent = 'Change Read Status'
    readBtn.classList.add('read-btn')
    item.classList.add(`book-card`);
    item.dataset.index = index;

    const imgContainer = document.createElement('img');
    imgContainer.src = book.imgLink;

    const cardTitle = document.createElement('h3');
    cardTitle.textContent = book.title;

    const cardAuthor = document.createElement('p');
    cardAuthor.textContent = `By ${book.author}`;

    const cardPages = document.createElement('p');
    cardPages.textContent = `${book.pages} pages`;

    const cardRead = document.createElement('p');
    cardRead.classList.add('read-status')
    cardRead.textContent = book.read

    if (book.read == 'Status: Read') {
        item.classList.add(`read`);
    } else {
        item.classList.add('not-read')
    }

    item.appendChild(imgContainer);
    item.appendChild(cardTitle);
    item.appendChild(cardAuthor);
    item.appendChild(cardPages);
    item.appendChild(cardRead);

    item.appendChild(readBtn);
    item.appendChild(button);

    library.appendChild(item);
};

function newBook() {
    const bookTitle = document.querySelector('#bookTitle').value;
    const bookAuthor = document.querySelector('#bookAuthor').value;
    const radioChoice = document.querySelectorAll('input[name="choice"]');

    let bookRead;
    for (const choice of radioChoice) {
        if (choice.checked) {
            bookRead = choice.value;
        };
    };

    requestBookInfo(bookTitle, bookAuthor, bookRead);
    alert('Book added successfully')
    modal.style.display = "none"
};

function removeBook(index) {
    myLibrary.splice(index, 1);
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    displayAllBooks();
}

function addRemoveBtns() {
    let remBtns =  Array.from(document.querySelectorAll('.remove-btn'));
    remBtns.forEach(btn => btn.addEventListener('click', function(e) {
        removeBook(parseInt(btn.dataset.index));
    }));
};

function addReadBtns() {
    let readBtns =  Array.from(document.querySelectorAll('.read-btn'));
    readBtns.forEach(btn => btn.addEventListener('click', function(e) {
        console.log(btn.parentNode.classList)
        if (btn.parentNode.classList.contains('read')) {
            console.log('read detected')
            btn.parentNode.classList.remove('read');
            btn.parentNode.classList.add('not-read');
            btn.previousSibling.textContent = 'Status: Not Read';
            myLibrary[btn.parentNode.dataset.index]['read'] = 'Status: Not Read';
            localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
        } else {
            btn.parentNode.classList.remove('not-read');
            btn.parentNode.classList.add('read');
            btn.previousSibling.textContent = 'Status: Read';
            myLibrary[btn.parentNode.dataset.index]['read'] = 'Status: Read';
            localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
        }
    }));
};

async function requestBookInfo(bookTitle, bookAuthor, read) {
    let title = bookTitle
    let author = bookAuthor
    let url = `https://www.googleapis.com/books/v1/volumes?q=${title}+inauthor:${author}&maxResults=1`
    console.log(url)
    let response = await fetch(url);
    let data = await response.json();

    let pageCount = data['items']['0']['volumeInfo']['pageCount'];
    let imgLink = data['items']['0']['volumeInfo']['imageLinks']['thumbnail'];

    console.log(pageCount)
    console.log(imgLink)

    addBookToLibrary(new Book(title, author, pageCount, read, imgLink))
    displayAllBooks();
}

function populateStorage() {
    localStorage.setItem('myLibrary', JSON.stringify(myLibrary));
    setLibrary();
};

function setLibrary() {
    myLibrary = JSON.parse(localStorage.getItem('myLibrary'));
    displayAllBooks();
};

let modal = document.getElementById("input-modal");
let newBtn = document.getElementById("new-btn");
let span = document.getElementsByClassName("close")[0];

let myLibrary = [];

const form = document.getElementById('bookForm');
const error = document.getElementById('error');
const bookTitle = document.getElementById('bookTitle');
const bookAuthor = document.getElementById('bookAuthor');

bookTitle.oninvalid = invalid;
bookAuthor.oninvalid = invalid;
form.onsubmit = submit;

newBtn.onclick = function() {
    modal.style.display = "block";
};
  
span.onclick = function() {
    modal.style.display = "none";
};
  
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    };
};

if(!localStorage.getItem('myLibrary')) {
    populateStorage();
  } else {
    setLibrary();
};