const http = require("http");

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);

  if (req.url === "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/sw.js") {
    res.writeHead(204);
    return res.end();
  }

  switch (req.url) {
    case "/":
      res.end("<h1>Hello World</h1>");
      break;

    case "/pizza":
      res.end("<h1>This is your Pizza</h1>");
      break;

    case "/home":
      res.end("<h1>Welcome Home</h1>");
      break;

    case "/about":
      res.end("<h1>About Us</h1>");
      break;

    case "/node":
      res.end("<h1>Welcome to Node.js</h1>");
      break;

    default:
      res.writeHead(404);
      res.end("<h1>404 - Page Not Found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server Running...");
});
