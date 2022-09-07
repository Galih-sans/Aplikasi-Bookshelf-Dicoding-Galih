const books = [];
const RENDER_EVENT = 'render-book';
const STORAGE_KEY = 'BOOKSHELF_APP';

// var data buku
const title = document.querySelector('#inputBookTitle');
const author = document.querySelector('#inputBookAuthor');
const year = document.querySelector('#inputBookYear');
const isComplete = document.querySelector('#inputBookIsComplete');

const completeBookshelfList = document.querySelector('#completeBookshelfList');
const incompleteBookshelfList = document.querySelector('#incompleteBookshelfList');

// periksa apakah browser support web storage
function isStorageExist() {
    if (typeof (Storage) === undefined) {
        alert('Browser tidak mendukung local storage');
        return false;
    }

    return true;
}

// generate unique id
function generateId() {
    return +new Date();
}

// objek buku
function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

// simpan data
function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
    }
}

document.addEventListener(RENDER_EVENT, function () {
    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    for (const book of books) {
        const bookElement = makeBook(book);
        if (!book.isComplete)
            incompleteBookshelfList.append(bookElement);
        else
            completeBookshelfList.append(bookElement);
    }
});

// muat data dari storage
function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);

    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener('DOMContentLoaded', function () {
    if (isStorageExist()) {
        loadDataFromStorage();
    }

    const inputBookForm = document.querySelector('#inputBook');
    inputBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchBookForm = document.querySelector('#searchBook');
    searchBookForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    })
});

// save book
function addBook() {
    const id = generateId();
    const bookObject = generateBookObject(id, title.value, author.value, year.value, isComplete.checked);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
    clearInputBookForm();

    swal('Buku telah disimpan');
}

// setelah input clear form
function clearInputBookForm() {
    title.value = '';
    author.value = '';
    year.value = '';
    isComplete.checked = false;
}

// cari buku
function searchBook() {
    const queryTitle = document.querySelector('#searchBookTitle');

    incompleteBookshelfList.innerHTML = '';
    completeBookshelfList.innerHTML = '';

    let result = 0;
    books.filter((book) => {
        if (book.title.toLowerCase() == queryTitle.value.toLowerCase().trim()) {
            result++;

            const bookElement = makeBook(book);

            if (!book.isComplete)
                incompleteBookshelfList.append(bookElement);
            else
                completeBookshelfList.append(bookElement);
        }
    });

    if (result == 0) {
        alert('Buku yang anda cari tidak ditemukan!');
        location.reload();
    };
}


function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;

    const textAuthor = document.createElement('p');
    textAuthor.innerText = `Penulis: ${bookObject.author}`;

    const textYear = document.createElement('p');
    textYear.innerText = `Tahun: ${bookObject.year}`;

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear);
    container.setAttribute('id', `book-${bookObject.id}`);

    if (bookObject.isComplete) {
        const unreadButton = document.createElement('button');
        unreadButton.classList.add('green');
        unreadButton.innerText = 'Belum selesai di baca';

        unreadButton.addEventListener('click', function () {
            swal('Buku dipindahkan ke rak belum selesai dibaca');
            markAsUnread(bookObject.id);
        });

        const removeButton = document.createElement('button');
        removeButton.classList.add('red');
        removeButton.innerText = 'Hapus Buku';

        removeButton.addEventListener('click', function () {
            let confirmRemove = confirm('Yakin mau menghapus buku?');
            if (confirmRemove)
                removeBook(bookObject.id);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('action');
        buttonContainer.append(unreadButton, removeButton);

        container.append(buttonContainer);
    } else {
        const readButton = document.createElement('button');
        readButton.classList.add('green');
        readButton.innerText = 'Selesai dibaca';

        readButton.addEventListener('click', function () {
            swal('Buku dipindahkan ke rak selesai dibaca');
            markAsRead(bookObject.id);
        });

        const removeButton = document.createElement('button');
        removeButton.classList.add('red');
        removeButton.innerText = 'Hapus Buku';

        removeButton.addEventListener('click', function () {
            let confirmRemove = confirm('Yakin mau menghapus Buku?');

            if (confirmRemove)
                removeBook(bookObject.id);
        });

        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('action');
        buttonContainer.append(readButton, removeButton);

        container.append(buttonContainer);
    }

    return container;
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }

    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function markAsRead(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function markAsUnread(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();
}

function removeBook(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));

    saveData();

    alert('Buku anda telah dihapus');
}