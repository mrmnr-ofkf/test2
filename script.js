const canvas = document.getElementById("drawCanvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

let drawing = false;
let lastX = 0, lastY = 0;

// UI elements
const colorPicker = document.getElementById("colorPicker");
const brushSize = document.getElementById("brushSize");
const opacityControl = document.getElementById("opacity");

// Current brush settings
let currentColor = colorPicker.value;
let currentSize = brushSize.value;
let currentOpacity = opacityControl.value;

// Update brush settings when UI changes
colorPicker.addEventListener("input", () => currentColor = colorPicker.value);
brushSize.addEventListener("input", () => currentSize = brushSize.value);
opacityControl.addEventListener("input", () => currentOpacity = opacityControl.value);

const socket = new WebSocket("wss://" + location.host + "/ws");

socket.onopen = () => console.log("WebSocket connected");
socket.onclose = () => console.log("WebSocket disconnected");
socket.onerror = (e) => console.error("WebSocket error", e);

socket.onmessage = (event) => {
  const data = JSON.parse(event.data);
  drawLine(data.lastX, data.lastY, data.x, data.y, data.color, data.size, data.opacity);
};

function drawLine(x1, y1, x2, y2, color, size, opacity) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.globalAlpha = opacity;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  ctx.globalAlpha = 1.0;
}

canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  lastX = e.offsetX;
  lastY = e.offsetY;
});

canvas.addEventListener("mouseup", () => (drawing = false));
canvas.addEventListener("mouseout", () => (drawing = false));

canvas.addEventListener("mousemove", (e) => {
  if (!drawing) return;

  const x = e.offsetX;
  const y = e.offsetY;

  // Draw locally
  drawLine(lastX, lastY, x, y, currentColor, currentSize, currentOpacity);

  // Send stroke data to server
  const payload = {
    lastX,
    lastY,
    x,
    y,
    color: currentColor,
    size: currentSize,
    opacity: currentOpacity,
  };

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }

  lastX = x;
  lastY = y;
});
