const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {

    if (req.url === "/" && req.method === "GET") {

        fs.readFile("messages.txt", "utf8", (err, data) => {

            res.writeHead(200, {
                "Content-Type": "text/html"
            });

            res.end(`
                <h2>Messages</h2>
                <pre>${data || ""}</pre>

                <form action="/addMessage" method="POST">
                    <input type="text" name="message">
                    <button>Add</button>
                </form>
            `);
        });

    }
    else if (req.url === "/addMessage" && req.method === "POST") {

        // Store incoming Buffer chunks
        const chunks = [];

        req.on("data", (chunk) => {

            console.log("Received Chunk:", chunk);
            console.log("Is Buffer:", Buffer.isBuffer(chunk));
            console.log("Chunk Size:", chunk.length, "bytes");

            chunks.push(chunk);

        });

        req.on("end", () => {

            // Merge all buffers into one
            const fullBuffer = Buffer.concat(chunks);

            console.log("\nComplete Buffer:");
            console.log(fullBuffer);

            // Convert Buffer to String
            const body = fullBuffer.toString();

            console.log("\nBody String:");
            console.log(body);

            // Parse form data
            const params = new URLSearchParams(body);
            const msg = params.get("message");

            fs.writeFile("messages.txt", msg, (err) => {

                if (err) {
                    res.statusCode = 500;
                    return res.end("Error");
                }

                res.writeHead(302, {
                    "Location": "/"
                });

                res.end();

            });

        });

    }
    else {

        res.writeHead(404, {
            "Content-Type": "text/plain"
        });

        res.end("Not Found");

    }

});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
});