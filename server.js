const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static("."));

let lastStrokes = [];

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(data) {
    try {
      const stroke = JSON.parse(data);
      lastStrokes.push(stroke);
      if (lastStrokes.length > 10000) lastStrokes.shift();

      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(stroke));
        }
      });
    } catch (e) {}
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));