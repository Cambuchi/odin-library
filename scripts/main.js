//class constructor for new books
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

    //get the read status of current book
    get current() {
        return this.read;
    }

    //set the read status of the current book
    set current(status) {
        if (status === "yes") {
            this.read = "Status: Read";
        } else {
            this.read = "Status: Not Read"
        }
    }
}

//class constructor for the library functions
class Library {
    //check if there is a cached book catalog (either list or null)
    modal = document.getElementById("input-modal");
    cachedCatalog = localStorage.getItem('catalog');
    catalog;

    constructor(catalogData = []) {
        //check if local storage is usable
        if (storageAvailable('localStorage')) {
        //if local storage is empty (returns null), set current catalog into localStorage
            if(!this.cachedCatalog) {
                this.catalog = this.populateStorage(catalogData);
            } else {
                this.catalog = this.setCatalogFromLocal(catalogData);
            };
        } else {
            this.catalog = catalogData;
        }
        //display all books on initial library creation
        this.displayAllBooks();
    }

    //sets the local storage to the passed in catalog
    populateStorage(catalog) {
        localStorage.setItem('catalog', JSON.stringify(catalog));
        return catalog;
    }

    //sets the catalog from the data in local storage
    setCatalogFromLocal(catalog) {
        catalog = JSON.parse(localStorage.getItem('catalog'));
        return catalog;
    }

    //takes a book and adds it to the catalog
    addBookToCatalog(book) {
        this.catalog.push(book);
        this.populateStorage(this.catalog);
    }

    //remove the book from the catalog and update display
    removeBook(index) {
        this.catalog.splice(index, 1);
        this.populateStorage(this.catalog);
        this.displayAllBooks();
    }

    //create the elements for the new book to insert into html
    createBookElement(book, index) {
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

    //on new book submission, gather data, then call API to gather additional info
    submitNewBook() {
        const bookTitle = document.querySelector('#bookTitle').value;
        const bookAuthor = document.querySelector('#bookAuthor').value;
        const radioChoice = document.querySelectorAll('input[name="choice"]');
    
        let bookRead;
        for (const choice of radioChoice) {
            if (choice.checked) {
                bookRead = choice.value;
            };
        };
    
        this.requestBookInfo(bookTitle, bookAuthor, bookRead);
        //alert user on submission success and remove modal popup
        alert('Book added successfully')
        this.modal.style.display = "none"
    };

    //request from google book API for cover art and page count
    async requestBookInfo(bookTitle, bookAuthor, read) {
        let url = `https://www.googleapis.com/books/v1/volumes?q=${bookTitle}+inauthor:${bookAuthor}&maxResults=1`
        console.log(url)
        let response = await fetch(url);
        let data = await response.json();
    
        let pageCount = data['items']['0']['volumeInfo']['pageCount'];
        let imgLink = data['items']['0']['volumeInfo']['imageLinks']['thumbnail'];
    
        //with all info gathered, add book into the catalog and rerender display
        this.addBookToCatalog(new Book(bookTitle, bookAuthor, pageCount, read, imgLink))
        this.displayAllBooks();
    }

    //for all books in the catalog, insert all of the book elements, buttons, and event listeners
    displayAllBooks() {
        document.querySelector('#library').innerHTML = "";
        for (let i = 0; i < this.catalog.length; i++) {
            this.createBookElement(this.catalog[i], i);
        };
        this.addReadBtns();
        this.addRemoveBtns();
    };

    //add event listeners to all of the remove buttons on the DOM, nested function needs to bind
    addRemoveBtns() {
        let remBtns =  Array.from(document.querySelectorAll('.remove-btn'));
        remBtns.forEach(btn => btn.addEventListener('click', function(e) {
            this.removeBook(parseInt(btn.dataset.index));
        }.bind(this)));
    };

    //add event listeners to all of the read status buttons on the DOM, nested function => bind
    addReadBtns() {
        let readBtns =  Array.from(document.querySelectorAll('.read-btn'));
        readBtns.forEach(btn => btn.addEventListener('click', function(e) {
            if (btn.parentNode.classList.contains('read')) {
                btn.parentNode.classList.remove('read');
                btn.parentNode.classList.add('not-read');
                btn.previousSibling.textContent = 'Status: Not Read';
                this.catalog[btn.parentNode.dataset.index]['read'] = 'Status: Not Read';
                this.populateStorage(this.catalog);
            } else {
                btn.parentNode.classList.remove('not-read');
                btn.parentNode.classList.add('read');
                btn.previousSibling.textContent = 'Status: Read';
                this.catalog[btn.parentNode.dataset.index]['read'] = 'Status: Read';
                this.populateStorage(this.catalog);
            }
        }.bind(this)));
    };
}

//higher level function used to determine if local storage is available
function storageAvailable(type) {
    var storage;
    try {
        storage = window[type];
        var x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            // everything except Firefox
            e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            // acknowledge QuotaExceededError only if there's something already stored
            (storage && storage.length !== 0);
    }
}

//IIFE to initialize all of the buttons, modals, and event listeners
(() => {
    
    const form = document.getElementById('bookForm');
    const error = document.getElementById('error');
    const bookTitle = document.getElementById('bookTitle');
    const bookAuthor = document.getElementById('bookAuthor');
        
    let modal = document.getElementById("input-modal");
    let newBtn = document.getElementById("new-btn");
    let span = document.getElementsByClassName("close")[0];

    bookTitle.oninvalid = invalid;
    bookAuthor.oninvalid = invalid;
    form.onsubmit = submit;

    function invalid(event) {
        error.removeAttribute('hidden');
    };

    function submit(event) {
        myLibrary.submitNewBook()
        form.reset();
        error.setAttribute('hidden', '');
        event.preventDefault();
    };

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

})();

//instantiate the library
const myLibrary = new Library()