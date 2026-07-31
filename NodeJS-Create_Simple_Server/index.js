const port = 3000;
const http = require("http");

const server = http.createServer((req, res) => {
  // console.log("Got the Request ::", req);
  console.log("Requested ::", req.method, req.url);
  let inputURL = req.url;
  if (inputURL == "/") {
    res.end("<h1>Hello World</h1>");
  } else if (inputURL == "/sw.js") {
    res.writeHead(404);
    return res.end();
  } else if (inputURL == "/favicon.ico") {
    res.writeHead(204);
    return res.end();
  } else if (inputURL == "/pizza") {
    res.end("<h1>This is your pizza</h1>");
  } else if (inputURL == "/home") {
    res.end("<h1>Welcome Home</h1>");
  } else if (inputURL == "/about") {
    res.end("<h1>Welcome to About Us</h1>");
  } else if (inputURL == "/node") {
    res.end("<h1>Welcome to my Node JS project</h1>");
  } else {
    res.end("<h1>Page not fountdd</h1>");
  }
});

server.listen(port, () => {
  console.log("Server Started at Port", 3000, "\n=======================================");
});
