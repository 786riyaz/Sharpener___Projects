# **How to Make Messages Live**

Have you ever built a chat app where users had to keep refreshing to see new messages? That's because traditional HTTP just isn't made for live conversations.

In this blog, we're going to explore how we can transform a basic message system into a **real-time chat** using different techniques. We'll start with the problem, try short polling and long polling, and finally reach the hero of live messaging: **WebSocket**.

---

## **The Problem with Traditional HTTP Requests**

HTTP follows a simple pattern: the client sends a request, the server responds, and the connection closes.

*![][image1]*

*![][image2]*

*A diagram showing client sending a GET/POST and receiving a response*

This model works well for static pages or one-time queries, but in real-time systems like chat, it falls short.

Let’s say you send a message to your friend. Until they manually ask the server by making a GET request, they won’t know you sent anything.

To "simulate" live updates, many beginners end up calling the server repeatedly, which brings us to…

---

## **🔁 1\. Short Polling**

Short polling is a quick hack: your client sends a GET request to the server every few seconds (e.g., using `setInterval()` in JavaScript). It keeps asking, “Do I have new messages?”

![][image3]

*HTTP Short Polling request/response diagram*

####   *Short Polling server Node.js code*

const express \= require("express");  
const cors \= require("cors");  
const path \= require("path");  
const app \= express();  
app.use(cors());  
app.use(express.json());

let messages \= \[\];

app.get('/', (req, res) \=\> {  
  res.sendFile(path.join(\_\_dirname, 'views', 'index.html'));  
});

app.get("/messages", (req, res) \=\> {  
  res.json(messages);  
});

app.post("/messages", (req, res) \=\> {  
  const { text } \= req.body;  
  messages.push({ text, timestamp: Date.now() });  
  res.sendStatus(200);  
});

app.listen(3001, () \=\> console.log("Short Polling server running on port 3001"));

#### Short Polling client HTML code

  \<\!DOCTYPE html\>  
  \<html\>  
  \<body\>  
    \<h3\>Short Polling Chat\</h3\>  
    \<input id\="msg" placeholder\="Type a message" /\>  
    \<button onclick\="send()"\>Send\</button\>  
    \<ul id\="chat"\>\</ul\>

    \<script\>  
      const url \= "http://localhost:3001";  
      const chat \= document.getElementById("chat");

      async function fetchMessages() {  
        const res \= await fetch(\`${url}/messages\`);  
        const data \= await res.json();  
        chat.innerHTML \= data.map(m \=\> \`\<li\>${m.text}\</li\>\`).join("");  
      }

      async function send() {  
        const text \= document.getElementById("msg").value;  
        await fetch(\`${url}/messages\`, {  
          method: "POST",  
          headers: { "Content-Type": "application/json" },  
          body: JSON.stringify({ text })  
        });  
      }

      setInterval(fetchMessages, 2000); // Poll every 2 seconds  
    \</script\>  
  \</body\>  
  \</html\>

### **✅ Pros**

* Easy to understand and implement

* No special protocol required

### **❌ Cons**

* Wastes server resources with repeated calls

* Not truly real-time (you may wait up to X seconds)

* Doesn’t scale well with many users

---

## **⏳ 2\. Long Polling**

Long polling is smarter. Instead of checking repeatedly, the client sends a request and the server **waits** until there’s a new message. Once it has data, it responds, and the client immediately makes another request.

*![][image4]*

*HTTP Long Polling timeline diagram*

####   *Long Polling server Node.js:*

*const express \= require("express");*

*const cors \= require("cors");*

*const path \= require("path");*

*const app \= express();*

*app.use(cors());*

*app.use(express.json());*

*let messages \= \[\];*

*let clients \= \[\];*

*app.get('/', (req, res) \=\> {*

  *res.sendFile(path.join(\_\_dirname, 'views', 'index.html'));*

*});*

*app.get("/messages", (req, res) \=\> {*

  *// Wait up to 20 seconds for a message*

  *const timeout \= setTimeout(() \=\> res.json(\[\]), 20000);*

  *clients.push({ res, timeout });*

*});*

*app.post("/messages", (req, res) \=\> {*

  *const { text } \= req.body;*

  *const message \= { text, timestamp: Date.now() };*

  *messages.push(message);*

  *// Respond to all waiting clients*

  *clients.forEach(({ res, timeout }) \=\> {*

    *clearTimeout(timeout);*

    *res.json(\[message\]);*

  *});*

  *clients \= \[\];*

  *res.sendStatus(200);*

*});*

*app.listen(3002, () \=\> console.log("Long Polling server running on port 3002"));*

#### Long Polling client HTML:

\<\!DOCTYPE html\>  
\<html\>  
\<body\>  
  \<h3\>Long Polling Chat\</h3\>  
  \<input id\="msg" placeholder\="Type a message" /\>  
  \<button onclick\="send()"\>Send\</button\>  
  \<ul id\="chat"\>\</ul\>

  \<script\>  
    const url \= "http://localhost:3002";  
    const chat \= document.getElementById("chat");

    async function poll() {  
      const res \= await fetch(\`${url}/messages\`);  
      const data \= await res.json();  
      data.forEach(m \=\> {  
        const li \= document.createElement("li");  
        li.innerText \= m.text;  
        chat.appendChild(li);  
      });  
      poll(); // Start next long poll  
    }

    async function send() {  
      const text \= document.getElementById("msg").value;  
      await fetch(\`${url}/messages\`, {  
        method: "POST",  
        headers: { "Content-Type": "application/json" },  
        body: JSON.stringify({ text })  
      });  
    }

    poll(); // Start first long poll  
  \</script\>  
\</body\>  
\</html\>

This gives a more “live” feel while avoiding repeated requests.

### **✅ Pros**

* Feels close to real-time

* Reduces unnecessary requests

### **❌ Cons**

* The server holds connections open, which can be expensive

* More complex than short polling

* Still not 100% live

---

## **🔄 3\. WebSocket – The Real Solution**

Now comes the real-time king: **WebSocket**.

Document: [https://websocket.org/](https://websocket.org/)

WebSocket upgrades a regular HTTP connection into a **persistent, bidirectional channel**. Once the handshake is done, both client and server can talk freely — no more asking for updates\!

![][image5]

*WebSocket handshake and message flow diagram*

#### WebSocket server Node.js:

const express \= require("express");  
const http \= require("http");  
const WebSocket \= require("ws");  
const app \= express();  
const server \= http.createServer(app);  
const wss \= new WebSocket.Server({ server });

let sockets \= \[\];

wss.on("connection", ws \=\> {  
  sockets.push(ws);

  ws.on("message", message \=\> {  
    sockets.forEach(s \=\> s.send(message)); // Broadcast  
  });

  ws.on("close", () \=\> {  
    sockets \= sockets.filter(s \=\> s \!== ws);  
  });  
});

server.listen(3003, () \=\> console.log("WebSocket server on port 3003"));

#### WebSocket client HTML:

\<\!DOCTYPE html\>  
\<html\>  
\<body\>  
  \<h3\>WebSocket Chat\</h3\>  
  \<input id\="msg" placeholder\="Type a message" /\>  
  \<button onclick\="send()"\>Send\</button\>  
  \<ul id\="chat"\>\</ul\>

  \<script\>  
    const socket \= new WebSocket("ws://localhost:3003");  
    const chat \= document.getElementById("chat");

    socket.onmessage \= async (event) \=\> {  
      const li \= document.createElement("li");  
      // li.innerText \= event.data; // It will return you Blog object  
      li.innerText \=  await event.data.text(); // Convert Blog to text  
      chat.appendChild(li);  
    };

    function send() {  
      const text \= document.getElementById("msg").value;  
      socket.send(text);  
    }  
  \</script\>  
\</body\>  
\</html\>

It’s perfect for chat apps, multiplayer games, collaborative tools, and more.

### **✅ Pros**

* Truly real-time — instant updates

* Lower server load (no repeated requests)

* Supports full duplex communication

### **❌ Cons**

* Needs a bit more setup

* Requires browser/server WebSocket support

---

## **📊 Comparison Summary**

| Method | Real-Time? | Server Load | Complexity |
| ----- | ----- | ----- | ----- |
| Short Polling | ❌ No | 🔴 High | 🟢 Simple |
| Long Polling | ⚠️ Almost | 🟡 Medium | 🟡 Medium |
| WebSocket | ✅ Yes | 🟢 Low | 🟢 Simple |

---

## **🏁 Conclusion**

We started with a problem — HTTP is great, but not for live messaging. We tried short polling (easy but inefficient), then long polling (closer but not perfect), and finally arrived at WebSocket, which gives us the live experience we truly want.

**Winner: WebSocket\!**

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAr0AAAGbCAIAAABGW785AAAk/UlEQVR4Xu3dMXLj3JkuYCxBS9AStATtQKz6A4dSMlM1dpUpb+C24gmmmTjzlJQ41m9Hk0wxdDZM7OBGWoKWwHsuvtHx6UNJDRGUgEM+T3V1gYcgSEDQ970CQbDbAgAM09UDAABvkBsAgKHkBgBgKLkBABhKbgAAhpIbAICh5AYAYCi5AQAYSm4AAIaSGwCAoeQGAGAouQEAGEpuAACGkhsAgKHkBgBgKLkBABhKbgAAhpIbAICh5AYAYCi5AQAYSm4AAIaSGwCAoeQGAGAouQEAGEpuAACGkhsAgKHkBgBgKLkB+Cw3NzdPT0/1KNAyuQEOoOu9OhITu966a3c8dd9yyeXC5yO/pPv7+zRxd3dXDgJHw680HMBug8wjly9iJN/Md52fn6fx9H8eL+eM6e6Nhc9Hfkllbliv19VsQOvmVXqgUbuNfMhISC02jT88POSRas7dB+6OZKvV6ubm5vHxMY/c9bb9uwbls2z7vh4HM/I8pdz7d99uSOEgDabnyiP5JZW5IS+2nFgul/lRyfPzc7yG9ETp3s1mU94LzM3rpQf4kN1GPmQk3A3LDWXnfnVRaYYYz2K8GvzpeNb1R0Hyvbe3t3m8FC8sprdvvE+RZ852FxXPVSUbYG7qSgHsoex/pd15ypHwfm7IaSDfW81QDUYXTz2+69/pqMbLB+bpV58iZoglPD8/5xnirZNv375tf3xgnngnN8RxhZhOyyxnyNNyA8xcXSmAPUTPuy+UHbGcpxwJb+WGUjH7P2d4fzDfLMfz9Hq9ThOLxaIaL5UjZ2dnu0srb+aJd3JDPCSSx26OWa1WndwAs1dXCmAPZf8bPhLeyg3FLLVXZ6gG881yPE/HoYKUBqrxUvdyVCCmY4Zqzt3xvXNDjMsNMHN1pQD2UPa/4SPhsLkhlhPnCpTvC5TzVNPxpkYez7qXYJGWmWe4vr7uXt6/iFeenitmjhn2yA1pOo5/dHIDzF5dKYA9lH1x+EjYOzeUYvzi4iKPpP5dzrw7nd9M+fbtWzmepZHNZhN3lffmke61dzo+lBvymRMpoMQD5QaYubpSAE1L/TgnhuHKvl4OxsSrl2FIz5LfxTgI5zdAE+pKAZyIyAqLxSLOeYy3G6oZqpGDi9fQX+DqMqbrOYCZ8VsKJyq/T/FWw3518LDy+xRvvQZgbvyiAgBDyQ0AwFByAwAwlNwAAAwlNwAAQ8kNAMBQcgMAMJTcAAAMJTcAAEPJDQDAUHIDADCU3AAADCU3AABDyQ0AwFByAwAwlNwAAAwlNwAAQ8kNAMBQcgMAMJTcAAAMJTcAAEPJDQDAUHIDADCU3AAADCU3AABDyQ0AwFByAwAwlNwAAAwlN3AAV8foX/7lX+r1BDh5cgNj1f32iPz3f/93vbYAp01uYJS60x4d0QGgJDcwSt1mj1G9zgAnTG5glKrF/t/2/eY3v6lWql5ngBMmNzBK2V///Oc/1024TeVKXckNAAW5gVHK/lq332aVK3UlNwAU5AZGKftr3X6bVa7UldwAUJAbGKXsr3X7bVa5Uldywwz8/e9//48T85e//KXeCjAPcgOjlP21br/NKlfqSm6YWt1RT8l6va43B0xNbmCUsr/W7bdZ5UpdyQ2T+tOf/lT30hNTbxGYmtzAKGV/rdtvs8qVupIbJlV30dNTbxGYmtzAKGV/rdtvs8qVupIbJlV30d6//du/vTp9lOotAlOTGxil7K91+21WuVJXcsOk6i7akxtgQnIDo5T9tW6/zSpX6kpumFTdRXtyA0xIbmCUsr/W7bdZ5UpdyQ2Tqrtor8XcsFwuf/e731WDv/zySzWyq94iMDW5gVHK/lq332aVK3UlN0yq7qK9FnND7EvlSAoN1cir6i0CU5MbGKXsr3X7bVa5Uldyw6TqLtprMTf89re//f3vf18NOt5Ai+QGRin7a91+m1Wu1JXcMKm6i/ZazA17q7cITE1uYJSyv9btt1nlSl3JDZOqu2hPboAJyQ2MUvbXuv02q1ypK7lhUnUX7ckNMCG5gVHK/lq332aVK3UlN0yq7qKnp94iMDW5gVHK/lq332aVK3UlN0zqj3/8Y91IT0y9RWBqcgOjlP21br/NKlfqSm6YWt1IT0m9LWAG5AZGKftr3X6bVa7UldwwA//4xz/qjnrs/vrXv9ZbAeZBbmCUsr/W7bdZ5UpdyQ0ABbmBUcr+WrffZpUrdSU3ABTkBkYp+2vdfptVrtSV3ABQkBsYpeyvdfttVrlSV3IDQEFuYJSyv9btt1nlSl3JDTPw97//vT5v8Nj95S9/qbcCzIPcwChlf63bb7PKlbqSG6ZWd9RTsl6v680BU5MbGKXsr3X7bVa5Uldyw6T+9Kc/1b30xNRbBKYmNzBK2V/r9tuscqWu5IZJ1V309NRbBKYmNzBK2V/r9tuscqWu5IZJ1V2053utYEJyA6OU/bVuv80qV+pKbphU3UV7cgNMSG5glLK/1u23WeVKXckNk6q7aE9ugAnJDYxS9te6/TarXKkruWFSdRfttZgblsvl7373u2rwl19+qUZ21VsEpiY3MErZX+v226xypa7khknVXbTXYm6IfakcSaGhGnlVvUVganIDo5T9tW6/zSpX6kpumFTdRXst5obf/va3v//976tBxxtokdzAKGV/rdtvs8qVupIbJlV30V6LuWFv9RaBqckNjFL21//8z/+sO3CbypW6khsmVXfRntwAE5IbGKVqsXUHbtBvfvObaqXqdeYL1V20JzfAhOQGRqlabPLnP/+5bsXt+MMf/lCvj9wwqbqLnp56i8DU5AZGqXvsMarXmS/0xz/+sW6kJ6beIjA1uYFR6h57jOp15mvVjfSU1NsCZkBuYJS6xx6jep35cv/4xz/qjnrs/vrXv9ZbAeZBbuAD6tp2IP/6r/9a9+oDqZ/pEFIPq7cLwMmQGxjqv/7rv+oWejj/5xP8+7//e/00B1JvGoCTITcwVN08T1i9aQBOhtzAUH/729/q/nmq6k0DcDLkBj7gf/7nf+oWenrqjQJwSuQGAGAouQEAGEpuAACGkhsAgKHkBgBgKLkBABhKbgAAhpIbAICh5AYAYCi5AQAYSm4AAIaSGwCAoeQGAGAouQEAGEpuAACGkhsAgKHkBgBgKLkBABhKbmBeLi8vu97NzU2MpOmnp6cY/HHe1z0/P6/X63oUfnR2dhY71Wq1qu8D3jaoEMPXyIlhsVikiYuLixhMuWHbB4Jq/lel0DAwYXCyYk+7v7+/vr5OEwN3LWArNzArqYI/PDzE9HK5jEMOkRui0Kebebq8mf92jPnzNLzq1T0k7zl3d3dx8/b2NmbrXrJF97KL5pnzY9Pumm/CEbOXMyOvlt3ux9yQ/t9sNjGRSnnctV6v02DM4HgDP/Xt27fYo2LvSiMXFxex28Q7Zdt+Bzs/P4/5uz5DxET6//r6Ou5KgymzxnjcBUfPjs6MdH0C2B2sckOW/i6Mu/KcW7mBj4i9Je1I5X4V+0/3Eim2LydD5Gzx6sz5UBkcN+WVGYkq/NQrK3J1M7JFKuVpQm5gD3l3en5+7vpjCTkTpAwRxxJix6seEu+d5cMMq9Xq8vIy7pUbOBHKKzMSRTyLwSjfeSTej8g3d3NDTORp2FW+T1HtNt3L2xPda7mhupnn6eQGTobaCgAMJTcAAEPJDQDAUHIDADCU3AAADCU3AABDyQ0AwFByAwAwlNwAAAwlNwAAQ8kNAMBQcgMAMJTcAAAMJTcAAEPJDQDAUHIDADCU3EBjus5OCzAZJZjGyA0AE1KCaYzcADAhJZjGyA0AE1KCaYzcADAhJZjGyA0AE1KCaYzcADAhJZjGyA0AE1KCaYzcADAhJZjGyA0AE1KCaYzcADAhJZjGyA3JXW+1Wj09PdX3AXwmJZjGyA3bfiPc39+n3HB+fv78/FzffQi2M/AqpYHG6GfbHzfC2dlZ+j+lh65XzhM3y//LicvLyzR9c3NT3kxBJD82zwmQqQs0RjPbFhthvV4/PDw8PT1Fv8935Rmur6+rkZi4u7uLm8+9NJGWEyPlbAAVpYHG6Gfb4nhAHGxIIeDi4uKmV6WEOA5RjuSbMX8SGSKNXF5exjzl/AAlpYHG6GfbnRBwf3+f326oZliv16/mhnx8opIWFVnEdgZepTTQGP1s+2MsSMqRmLi8vIyPWnS97ctpEKvVKm4+Pz+n6W3/9kTMGUcd0v8RKWJ+gIoSTGPkhrekALHZbPLNlAyqSLH7oc2Y4a2bu/MDKME0Rm74KFsMOCAFhcboggATUoJpjNwAMCElmMbIDQATUoJpjNwAMCElmMbEBwtLFxcXl5eXd3d39/f35QcKADg4uYHGpKCwXq9TSri5uTk/P69DxDBnZ2c5aqSlfdJXQwEcH7mBxnQ/e58ihYDNZpMCQYoFKRzsnS3SAxeLRVrI4+OjKxkAhJ+UYJib7me5YT8pGcRhjJQVLi4u6hAxTIoaKaksl8s4jFE/B0D7PqUEw+fpPic3DJGiQAoEKRaMOYyRQkkcxkiLchgDaM5kJRj2002XG/aQksHj4+NqtRp/NkZagrMxgMm1VIJh21pu2EN8r0R8xWWKCyk01DlimIgaKbKkpTmwARzKkZdgjk937LlhiHw2RkoGzsYAvpISTGM6uWFfKRysVquR52fEYYwUWY71MEbaREe5XnAoSjCN6eSGTxNnY8SHSlI+qCPDMOXZGJvNprmzMWIt6lHghV8PGqOmz8rxnY2R1iheUn0H0PO7QWMU9OZsNpsDno0R2aJ+joNKwSWetL4DkBtojmp+Ig54GGOPszG+ffvW9RfbqO+Ak6cE05hObuANKRzk8zP2PvEzDmykhXz//j1G6qeB0+ZXgsao4+wtPr8al+EafuJnvRQ4bX4laIw6zteIUzHOzs7qO+C0KcE0Rm7gC8QZFc5vgF1KMI2RG/hs8fbEt2/f6jsAuYHmyA18qggNm82mvgPoKcE0Rm7g86xWq7SDNXeNS/hKSjCNkRsAJqQE05iTzQ3lBQnq+w5k9zqM8VzlRxY/dPUk4Ph8VgGCT/J5XXPmUm7I06mRx8Tz83P1Tnz0/ujuuceXzb4KB/nhcXHlKhbk3JAfdXt7W84AnJoTLcG0S27Y9p8S3PYXGIgvn7y7u9u+NP7lchkHBrbFtionYobIB2mZcTOlh5ubmzSR/o85yweWuSGp5gFOyomWYNp1yrnhspe3QO7fVUrYHYmJ8moEuw/ZvZlHqtxQJhjg1NRlAmZut7ediNStn56eHh8f8xUMu0LczDNXI/lmaftyiCLngDx/FiNVbsjvkpD98h9PP/1XPwbaVJcJmLnd3nYicnfPbTsHiIeHh22/ZfLZCbGV8raKiXg7I0QOWC6X5Qy723Y3NxzNwYa0re7v79MW+OlXe9ePfM1uStj9Vz8G2jToVwLmY2AdPz6750WmhpcGb25u4q7d8xu+f/9+1ssbLc8QF0NMEylMpP8fHx+3fbCojiXEAy/7b7KOD3S0dbAhh4Py0yg/FVs1bY3NZjPwWg67KWH3X/0YaNOJlmDa1Z1qbviQ495KqZfH92WnEPOhQJDmT4EgJYmBaeAg5AaOzDEXF45Sd9Qd8VAafTch/X2fmnpq7T9976CUVnaxWKxWq+pDpDMhN3BklGAa08kNjds7HMShgt2LU82c3MCRUYJpTCc3zFJ81mO5XKY//eue/7Z8/YmUBr7yvYOvJDdwZJRgGtPJDdOJEwtSOLgsrjz9U+f9lSdSOEiPPdZw8A65gSOjBNOYTm74BJvNZrVaxUcz6rb/tvzewTxPLJgJuYEjowTTmE5u2FcKB+mP/j3CwXK5FA72JjdwZJRgGtPJDT8afv2i0tnZWVyioLnTDJsjN3BklGAa051Mbnh8fFytVovF4kOHB/IlChwemAm5gSNzKiWYo9EdUW4Yf/0i4WD+5AaOzPGUYE5EV+SGaKLFnXOx9yUK5nz9IvYjN3Bk5lhz4R3dS1B46r+OIX+309eLEwv2CAeNXr+I/cgNHBm5gcZ0fW64vb3t+q9oqu8e7Wnc9Yu++LsPmD+5gSMjN9CYrs8N0a3r+wZz/SK+jNzAkdm/8sIkchev7+i5fhFzIzdwZF4vvvCpciV9/1/9sF50etcvohXv78/QHLmBCexGhFf/1Q/rVWmgvH6R9w6Yoff3Z2iO3MAEdiPCq//qh/VyYnh8fKzvg/l5f3+G5sgNTGBMJe0OcV4kfJkxezvMkMrLBMZU0hwX4uSGCa/fAEOM2dthhuQGJjCmkpaHGeKow2q1Ku6HeRmzt8MMyQ1MYEwlrd6e8OEIZm7M3g4zJDcwgTGV1GkNtGXM3g4zpAQzgTGVVG6gLWP2dpghJZgJjKmkcgNtGbO3wwwpwUxgTCWVG2jLmL0dZkgJZgJjKqncQFvG7O0wQ0owExhTSY8jN9zd3dVDhbve/D9f+tYrXK/Xi8XCR13CmL0dZugYSjDNGVNJjyM3vL8W5+fnMXF/f/9JX7rx/gsYKL/O0lMvTVxeXtb3naQxezvM0AFqB3zUmEp6kIY3ubwWcemqKhyU/fj29nbbN+OYM49fXFykm5vN5ubmZvvjAmPi7Oys6784NG6u1+t0M89cLW378hQxHffmAwaxqHjstj8cEjfjdZb5IM8Ts+XpUzZmb4cZOoYSTHPGVNKq2zUq1iKvy1u5IYWGaN65H+8+8NXckJeQ4kL09RjPUWB3M37//j0m8l3VAYP0YiIKpGXGSJ4zxq+vr+Nm8vj4mJJNvnnK9tjbd386pffvze7v78sYty0e+O3bt3J8vIEvaZdw2aI9f9gwxh6VNNu7Qs1K2ea74i/7kLp+GrnslbOFuJlnfjU3lPPHSOoiaaJc4P8+/kWZBsoH5pGUA1KVT8t5ecQ/g0XMWS6znD5xH93b03ZOcbD84pU4wPPw8LAtfjoxHTPkifQT6V6+KrbKDfGo+JFFrIxlxmPjgZvNJmaOL3+pmnq5hNVqFTfzXTERL7s6PNb1e3j6v3pjK+aJ2WIdX33ni7n5358rfKWPVtJSLkZNq9aiupmrZx7PTb0a376dG/IMpcViUc2f7R5FCPmwQZytmVvLtpgz9ZJff/217FJVEjplH93bq59g2ua5zcdWrX7WeSLNFgcS4uY7xxvyAvP8z72YIf2IY2d464hRvOcV03FubNzMWSffGyNdHzq3L2+6lXI0iZdUvlnGbPkJMYGPVtJS1//FE3/4lj2sLVEcr6+vU2VfLpfVn1n5ZirlUVhT/U2DacWj0MfBg/TANB69Id0bZzzkstv1fy92RbMpb8bSYs6Qc0PaqunetPBYVLzTkW7G8YZtv6iUP+IHkR+enzdJGaK8eeI+urdHJ34rxpUjuxPpZxc/mu2w3FCNx0TXn7wSqsCaxRtkaTk5hpavM+0Y8fC8wHxXFShjjyoPYsUCmbN//jjhy3y0kpaiQr0vdbhUfVJJSlVv5n/4plc4MP2kSl2tSzww19ndNa2KfnVzd/4sPVc58+6L3G0n1d+m7yz81Hxob49EGOKv825wbkghMjXsfNhgTG54evHqx3niRcaPOOeGlFfyPpBmyEuIe/NjYyTbzQ1XV1d5mnmq90j4Ah+qpJXdMppa2uPjYypA8QdQt5f4+zstJC1qtynO2Rz+Put2fihkH9rbyy0Z03c/e5/i6eXYfvfywZy4uXduyDExmnopfjXSYiPTPDw85Nyw7Z8xZqgWWK5UlRvyIat4SXldmDM/ISbwoUpa2aOsxF/PUUZTnYpPFe4hjr6uVquULaryB28Zvrenbt0Vu3fa3+I9i9Sk03j+wEva/WK26LKX/SmN+WbYvpYb0nLihIP3c0PMEEuOm1kazEvo+pdU5oY8kV9JORiqX5xYzrb/iEdeODP3zx8nfJnhlXRXWYM+VSpwqfKmP7kWi8XIwxjL5fK+5bMxGGPM3g4z9EUlGEpjKmn3VblhiPV6nf4iTLEghYP9skX6A6uhszHYw5i9HWZoRiWY0zGmknZzyg17yGdjjD+Mcdf4h0pOxJi9HWao7RJMo8ZU0q7x3LCH8vyMi4uLMednLJfL1WrlwMZXGrO3wwydXAlmDsZU0u70csMQm80mzsZI4SBfyOGjzs/PF4tFnI3R1odK5mzM3v6Vdj89Aa9SgpnAmErayQ0H8vT0FOdnxMdM6hAxTFwzIC0hosarH/dvS3foqx2P2du/QPfapx6mMofXwE/5ITGBMZVUZflKKQqc2tkY8Zrr0RE+tLd3L9fizJdkfnh4iE8nxpdWdC9fVLF9+ZKI/NnF6tOPef74uop1f3Ho7scvQ7npL+kYD+n676foithULTDLL2n78l2p8RTbl++5KK85EeP58FV+GXGzfIq3no658RNiAh+qpBVlZebKwxh7v2PSFVfLWH/52RiRkHJ7HulDe3u302gvd76KLL+hkF9hXEQhX60h5szzR1bLN6uNmcerpy4v/5DvCrvj8VWo6+KA01u5IV+FIpJHteTqJvPkh8QEPlRJKyrLETjg2RhxGCO3pUOJp6hH9/Khvb180ogFOSWU5x9sXr56qhRfWhaHELYv6SfPFltsN4HlZ6zWN/1cqgVmOa90L99kkebc/njp0ldzQ3yrRbnMs14+CnWobc6n8kNiAh+qpBWV5TTFYYy7/mriX3M2RjykHv24D+3t5TNGr81xIXfl58LLvP9ffrOgUq3FWzer8aurq7cWWOaGcjyubhlezQ3b/sW/zPKDan7mzA+JCXyoklZUFoZb959fjQMb8ff3HuqFftCH9vZ4xvzn+PbHb5o+788UyXd1/ZkE5akGMUN8aepZf0mxPH8sNuaJ+UP38iXXu2uaZo5rmsUCs5wbUpg7778Ss3xJ8U2q8Sxxhey0nPz2RMyQlhmhpOvP50g345BDuXbMlp8QE/hQJa0oKxxQeTbGW4cx6sd80If29ni6t84efd75TtTqqEk1w1Mv30yLffXP/d03L7L1z04uSQusXm0cWqjSSalaZvWqXn2FzMrYXwnYw4cqaWV8HYefeno5t//9rjnEh/b2o9m938kNtO5I9lHa8qFKWjmawsqcRWg4yN++Y/Z2mCElmAmMqaRyA58qv1tR37GvMXs7zNDBfjdguDGV9IAFHSr57Yn6jhHG7O0wQ4f89YCBxlTSw9Z0qFSfHRhvzN4OM6QEM4ExlVRuoC1j9naYISWYCYyppHIDbRmzt8MMKcFMYEwllRtoy5i9HWZICWYCYyqp3EBbxuztMENKMBMYU0nlBtoyZm+HGVKCmcCYSio30JYxezvMkBLMBMZUUrmBtozZ22GGlGAmMKaSyg20ZczeDjOkBDOBMZVUbqAtY/Z2mCEleKbOzs5ionv5JvuY/uccL2Iwf2tfunl5eVnO8FPxvbebzebV5X+GMZX0y14kHMSYvR1mSAmeqdwdu141uOvu7q4eGuydxX6SMZX0618tjDFmb4cZUoJnKh9jWCwWefrm5ia+dyelhNw+072Pj48XFxfp3vV6nf5/eHjY9v01Taf/b29vt/0BibOzs/TAuJnFPOn/eEj8n+a8vr6+vLxM4+n/1WoVS0h3LZfLfCxkb2MqqdxAW8bs7TBDSvBM/frrrzGRunU5nf/f9u8sbF8SRj7eUOaGGMlpIG7uHpl4a863xlOSiLc29jamksoNtGXM3g4zpATPV/or/+rqqprO3/Obm/dHc8Out+bcHc/i+MTexlTSd1YEZmjM3g4zpATP19nZWe6ReTr9n4837Jcbdg8VvDXnW+PjjamkB3wZ8AXG7O0wQ0rwfHU/fpIipm9vb7v+JIN0s8wNz8/PMfJWboiJrogdWRq8uLiIifz/7kR84CI99fjOPaaSjn92+Epj9naYISX45MRZEdMaU0nlBtoyZm+HGVKCT0WKC+fn5/Hpifq+Lzemks7h9cNwY/Z2mCElmAmMqaRyA20Zs7fDDCnBTGBMJZUbaMuYvR1mSAlmAmMqqdxAW8bs7TBDSjATGFNJ5QbaMmZvhxlSgpnAmEoqN9CWMXs7zJASzATGVFK5gbaM2dthhpRgJjCmksoNtGXM3g4zpAQzgTGVVG6gLWP2dpghJZgJjKmkcgNtGbO3wwwpwUxgTCWVG2jLmL0dZkgJZgJjKqncwAzlXfqdf/VjoE1KMBMYU0nlBmZoNyXs/qsfA21SgpnAmEoqNzBDuylh91/9GGiTEswExlRSuQFgQkowE5AbABqlBDMBuQGgUUowE5AbABqlBDMBuWG87sXNzU19H8CnUYKZgNwwXt4O9/f3eXCz2eTp5Onp6fn5OU/vzlDejBnW63Ue2b1ZPRw4QUowE5AbxsvbIffyOPaQ/r+7u8s3z8/Pb29v4+bZ2dnl5WV+YJ4/30wzXF9flyNpUW/ND5wmJYAJyA3jpe1w2YsN8uuvv5Z35f+rwe1rxxWq+WOG5OLi4mWWH5afskieBk6NEswE5Ibx8naI8xvu7u6eCnHXZrM575XzJ8/Pz+W7G2/lhm2/2Bh/dfnACVKCmYDcMF7eDjHx3IuRh4eH9P/j42M5Q57/+vo6JvIhhypYvBoL0sLz+KszACdCCWYCcsN4ZZuPoHB7e9v15yhEgIgzFfLNNJ3yQfr/+/fv8cBv377FDLsLjImY//LyMm7m5cdN4DQpwUxAbvh6thtwEEoJE5Abvp6TGYd7enq6v7+/u7u76NV3w2lTgpmA3MDkIhwsl8uUDLp31Y+E0+ZXggnIDXyex8fH1Wq1WCzi/IyBLi8vb25uUpJw1ie8TwlmAnIDYzw/P6dwcHd3l5r9fuEgf/YE+CglmAnIDbxqs9mkpp5a+0/fOyil6LBYLFarlUMF8AWUYCYgN5yU1M7X6/Xd3V3q7mdnZ3Xbf0OaM6WH9Kj0WIEA5kMJZgJyw/FJrf3x8XG5XKZwUEeAt8VXZkQ48N4BNEEJZgJyQ0M2m81qtYqvyKrb/tvSzE4zhKOkBDMBuWFuhANgICWYCcgNXyMuURDXL/rQiQWLxSLeO6iXCJw8JZgJyA0HFOFgyPWLSikc3NzcCAfARynBTEBuGML1i4AZOpUSzKyccm6IwwN7X6Jgs9nUSwT4Qm2XYBp1qNwQPbW4cy5cvwg4VnOsuRy9g+SGOHr/+Pj44/2f6Mn1i4CTJzcwgfG54fb2Nk0sl8v67tGexl2/yHcfAMdNbmACI3NDau1df1S/vu9dLlEAMJ7cwARG5oZQ39ETDgA+1evFFz5Vzg3v/6sf1qt7/ttcvwjg4OQGJrAbEV79Vz+stxsO8vWLnFgA8NnkBiawGxFe/Vc/rJcTw1d+kgKAIDfQmK4/syGiw8XFRX03AJ9JbqAxkRu2L9dvODs7+/F+AD6R3EBjcm5Ivn371vXfyFDcD8AnkhtoTJkbtv1lmsqbAHwquYHGVLkBgK+kBNMYuQFgQkowjZEbACakBNMYuQFgQkowjZEbACakBNMYuQFgQkowjZEbACakBNMYuYHPcH5+Xg8Br1GCaYzcwME9PT11vfoOYIffExqjuPMZIjc46gA/pQTTGLmBTxLRYb1e13cABSWYxsgNfJLv3797twJ+ym8IjVHW+TyRG+xj8A6/HjRGTefzPD8/R27YbDb1fUBPCaYxcgOf6vz8PKKDr2iHVynBNEZuOD5PIzw/P9eLGy1ygz0NXuUXg8a0Xs1zw1v3Hh8f71/cvbh5cfni/EVuaXyqtM27xvc0+CR+MWjM+GoebXuz2ZRt+9WGfYLdOq9yklPLYrHIWybJ+SbJoSdEGMpySMrqH8ZB5WeJZ0+vZ7VaxY81rUL+gdbr3HVnZ2exvmnO9JA4hpHGb29v6+eAkze2BMNXSs2gLvlfaLehRh9dLpdVE91tnPWaMFf51MhudEKFo+QXg5bk/h1/9UaH1pU5lHw0or4DeOHXg5ao6XyqtHddXFzUo0BBCaYxcgPAhJRgGiM3AExICaYxcgPAhJRgGiM3AExICaYxcgPAhJRgGiM3AExICaYxcgPAhJRgGrObG+KiDjc3N9U4AAdXl2CYuTI3PD09RWgIxVwAfAqllsbkfCA0AHw91ZbGRETIoSEmzs/P6/kOIb6SKn9JVf7aqrfkObNYQlY/AUBr5AYaE7khH2MYHxpSv18ul7FA3vLWd4HGF4wlq9UqwtPj42OZmeI7qYGjITfQmNzGypsHcXFxkXrej8/WqtSt80GO8vhHPjQSzT5JmSna/2KxyJkgp4R6G83S2dlZBJqcY/KxH8d44ODkBhoTrSLfTI3ho+0tekzqLqmv+Gv4y1Qhpowv0e8jsqT0ln5AKQrUP7bPkZ4rBaYcNeoXDeyQG2hJ1Pp6FN6V88pqtYqYEsdUfkgQO+qlAD2/G7REQedTPT8/39/fLxaL83EnzcARU4JpidwAMC0lmJbIDQDTUoJpidwAMC0lmJbc3d2l3OBDEABTkRtoTDf6Qk8A7E1uoDHepwCYkBJMY+QGgAkpwTRGbgCYkBJMY+QGgAkpwTRGbgCYkBJMY+QGgAkpwTRGbgCYkBIMAAwlNwAAQ8kNAMBQcgMAMJTcAAAMJTcAAEPJDQDAUHIDADCU3AAADCU3AABDyQ0AwFByAwAwlNwAAAwlNwAAQ8kNAMBQcgMAMJTcAAAMJTcAAEPJDQDAUHIDADCU3AAADCU3AABDyQ0AwFByAwAwlNwAAAwlNwAAQ8kNAMBQ/w+hssbsXQ9HcAAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,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>