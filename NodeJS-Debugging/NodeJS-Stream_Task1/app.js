const http = require("http");

const routes = require("./routes");

const server = http.createServer((req, res) => {
  // Method 1 :: Directly call the handleRequest function
  // routes(req, res);
  
  // Method 2 :: Call the handleRequest function from the exported object
  routes.handleRequest(req, res);
});

server.listen(3000, () => {
  console.log("Server Running...");
});
