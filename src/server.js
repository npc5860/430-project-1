const http = require('http');
const query = require('querystring');
const handlers = require('./handlers.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const getHandlers = {
  '/': handlers.getIndex,
  '/getBook': handlers.getBook,
  '/getBooks': handlers.getBooks,
  '/getAllBooks': handlers.getAllBooks,
  '/getBookTitles': handlers.getBookTitles,
};

const postHandlers = {
  '/addBook': handlers.addBook,
  '/reviewBook': handlers.reviewBook,
};

const handlePost = (request, response, handler) => {
  if (request.headers.get('Content-Type') === 'application/x-www-form-urlencoded') {
    const body = [];

    request.on('error', (error) => {
      console.dir(error);
      response.statusCode = 400;
      response.end();
    });

    request.on('data', (chunk) => {
      body.push(chunk);
    });

    request.on('end', () => {
      const bodyString = Buffer.concat(body).toString();
      request.body = query.parse(bodyString);
      handler(request, response);
    });
  } else {
    request.body = JSON.parse(request.body);
    handler(request, response);
  }
};

const onRequest = (request, response) => {
  console.log(request.url);

  const protocol = request.connection.encrypted ? 'https' : 'http';
  const parsedUrl = new URL(request.url, `${protocol}://${request.headers.host}`);

  request.acceptedTypes = request.headers.accept.split(',');
  request.query = Object.fromEntries(parsedUrl.searchParams);

  if (request.method === 'POST') {
    if (postHandlers[parsedUrl.pathname]) {
      handlePost(request, response, postHandlers[parsedUrl.pathname]);
    }
  } else if (getHandlers[parsedUrl.pathname]) {
    getHandlers[parsedUrl.pathname](request, response);
  } else {
    handlers.notFound(request, response);
  }
};

http.createServer(onRequest).listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
