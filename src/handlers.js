const fs = require('fs');

const index = fs.readFileSync(`${__dirname}/../client/client.html`);
const books = JSON.parse(fs.readFileSync(`${__dirname}/../data/books.json`));

const writeResponse = (request, response, status, object) => {
  const content = JSON.stringify(object);

  response.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(content, 'utf8'),
  });

  if (request.method !== 'HEAD' && status !== 204) {
    response.write(content);
  }

  response.end();
};

const getIndex = (request, response) => {
  response.writeHead(200, {
    'Content-Type': 'text/html',
  });
  response.write(index);
  response.end();
};

const getBook = (request, response) => {
  if (!request.query.title) {
    const object = {
      message: 'Missing title parameter',
      id: 'missingParameters',
    };
    writeResponse(request, response, 400, object);
    return;
  }

  const object = books.find((b) => b.title === request.query.title);
  writeResponse(request, response, 200, object);
};

const getBooks = (request, response) => {
  let object = books;
  if (request.query.title) {
    object = object.filter((b) => b.title === request.query.title);
  }
  if (request.query.author) {
    object = object.filter((b) => b.author === request.query.author);
  }
  if (request.query.country) {
    object = object.filter((b) => b.country === request.query.country);
  }
  if (request.query.language) {
    object = object.filter((b) => b.language === request.query.language);
  }
  writeResponse(request, response, 200, object);
};

const getAllBooks = (request, response) => {
  writeResponse(request, response, 200, books);
};

const getBookTitles = (request, response) => {
  const object = books.map((b) => b.title);
  writeResponse(request, response, 200, object);
};

const addBook = (request, response) => {
  const object = {};
  object.message = '';
  const post = request.body;
  let missingParameter = false;
  if (!post.title) {
    object.message += 'Title is required ';
    missingParameter = true;
  }
  if (!post.author) {
    object.message += 'Author is required ';
    missingParameter = true;
  }
  if (!post.link) {
    object.message += 'Link is required ';
    missingParameter = true;
  }

  if (missingParameter) {
    object.id = 'missingParameter';
    writeResponse(request, response, 400, object);
    return;
  }

  post.pages = parseInt(post.pages, 10);
  post.year = parseInt(post.year, 10);
  post.genres = post.genres.split(',');

  const book = books.find((b) => b.title === post.title && b.author === post.author);
  if (book) {
    book.author = post.author;
    book.title = post.title;
    book.link = post.link || book.link;
    book.country = post.country || book.country;
    book.language = post.language || book.language;
    book.pages = post.pages || book.pages;
    book.year = post.year || book.year;
    book.genres = post.genres || book.genres;
    writeResponse(request, response, 204, book);
    return;
  }

  books.push(post);
  writeResponse(request, response, 201, post);
};

const reviewBook = (request, response) => {
  const post = request.body;
  if (!post.title) {
    const object = {
      message: 'Title is required',
      id: 'missingParameter',
    };
    writeResponse(request, response, 400, object);
    return;
  }
  if (!post.rating) {
    const object = {
      message: 'Review rating is required',
      id: 'missingParameter',
    };
    writeResponse(request, response, 400, object);
    return;
  }

  post.rating = parseInt(post.rating, 10);

  const book = books.find((b) => b.title === post.title);
  if (!book) {
    const object = {
      message: `Book '${post.title}' does not exist`,
      id: 'invalidParameter',
    };
    writeResponse(request, response, 400, object);
    return;
  }

  if (!book.reviews) {
    book.reviews = [];
  }
  book.reviews.push(post.rating);
  writeResponse(request, response, 200, book);
};

const notFound = (request, response) => {
  const object = {
    message: `${request.url} not found.`,
    id: 'notFound',
  };
  writeResponse(request, response, 404, object);
};

module.exports = {
  getIndex,
  getBook,
  getBooks,
  getAllBooks,
  getBookTitles,
  addBook,
  reviewBook,
  notFound,
};
