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

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", () => {

            const params = new URLSearchParams(body);
            const msg = params.get("message");

            fs.writeFile("messages.txt", msg, err => {

                if (err) {
                    res.statusCode = 500;
                    return res.end("Error");
                }

                res.statusCode = 302;
                res.setHeader("Location", "/");
                res.end();
            });

        });

    }
    else {

        res.statusCode = 404;
        res.end("Not Found");

    }

});

server.listen(3000);