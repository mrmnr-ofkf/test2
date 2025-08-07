const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let drawing = false;
let lastX = 0, lastY = 0;
let color = "#000000";
let size = 5;
let opacity = 1.0;

const socket = new WebSocket("wss://" + location.host + "/ws");

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  ctx.strokeStyle = data.color;
  ctx.lineWidth = data.size;
  ctx.globalAlpha = data.opacity;
  ctx.beginPath();
  ctx.moveTo(data.lastX, data.lastY);
  ctx.lineTo(data.x, data.y);
  ctx.stroke();
  ctx.globalAlpha = 1.0;
};

canvas.addEventListener("mousedown", e => {
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener("mouseup", () => drawing = false);
canvas.addEventListener("mouseout", () => drawing = false);

canvas.addEventListener("mousemove", e => {
  if (!drawing) return;
  const x = e.offsetX;
  const y = e.offsetY;
  const payload = { x, y, lastX, lastY, color, size, opacity };
  socket.send(JSON.stringify(payload));
  lastX = x;
  lastY = y;
});