const fs = require("fs");

function handleRequest(req, res) {
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

      <br>
      <a href="/read">Read Messages</a>
    `);
  }

  // Save Message
  else if (url.pathname === "/message" && req.method === "POST") {
    // Array to store Buffer chunks
    const chunks = [];

    req.on("data", (chunk) => {
      console.log("--------------------------------");
      console.log("Received Chunk:");
      console.log(chunk);
      console.log("Is Buffer :", Buffer.isBuffer(chunk));
      console.log("Chunk Size:", chunk.length, "bytes");

      // Store the Buffer
      chunks.push(chunk);
    });

    req.on("end", () => {
      console.log("--------------------------------");
      console.log("All Chunks Received");

      // Combine all Buffers
      const fullBuffer = Buffer.concat(chunks);

      console.log("Combined Buffer:");
      console.log(fullBuffer);

      // Convert Buffer into String
      const body = fullBuffer.toString();

      console.log("Body String:");
      console.log(body);

      // Parse the form data
      const params = new URLSearchParams(body);
      const username = params.get("username");

      console.log("Username:", username);

      fs.writeFile("messages.txt", username, (err) => {
        if (err) {
          res.writeHead(500);
          return res.end("Error writing file");
        }

        res.writeHead(302, {
          Location: "/",
        });

        res.end();
      });
    });
  }

  // Read Message
  else if (url.pathname === "/read") {
    fs.readFile("messages.txt", "utf8", (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end("Error reading file");
      }

      res.writeHead(200, {
        "Content-Type": "text/html",
      });

      res.end(`
        <h1>Messages</h1>
        <p>${data}</p>
        <a href="/">Go Back</a>
      `);
    });
  }

  // 404
  else {
    res.writeHead(404, {
      "Content-Type": "text/html",
    });

    res.end("<h1>404 Not Found</h1>");
  }
}

// Method 1 :: Export the handleRequest function
// module.exports = handleRequest;

// Method 2 :: Export an object with the handleRequest function
// module.exports = {
//   handleRequest: handleRequest,
// };

// Method 3 :: Export the handleRequest function directly
// module.exports.handleRequest = handleRequest;

// Method 4 :: Export the handleRequest function using shorthand property
module.exports = { handleRequest };