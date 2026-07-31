const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  // Home Page
  if (url.pathname === "/") {
    res.writeHead(200, {
      "Content-Type": "text/html",
    });

    res.end(`
            <h1>Home Page</h1>

            <form action="/message" method="POST">
                <label>Name : </label>
                <input type="text" name="username">
                <button type="submit">Add</button>
            </form>
        `);
  }

  // Save Message
  else if (url.pathname === "/message" && req.method === "POST") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      const username = body.split("=")[1];

      fs.writeFile("messages.txt", username, (err) => {
        if (err) {
          res.writeHead(500);
          return res.end("Error writing file");
        }

        res.statusCode = 302;
        res.setHeader("Location", "/");
        res.end();
      });
    });
  } else {
    res.writeHead(404, {
      "Content-Type": "text/html",
    });

    res.end("<h1>404 Not Found</h1>");
  }
});

server.listen(3000, () => {
  console.log("Server Running...");
});
