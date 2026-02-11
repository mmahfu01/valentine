console.log("script loaded");

const introScreen = document.getElementById("introScreen");
const envelope = document.getElementById("envelope");
const aweejYesBtn = document.getElementById("aweejYesBtn");
const aweejNoBtn = document.getElementById("aweejNoBtn");
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const askScreen = document.getElementById("askScreen");
const yesScreen = document.getElementById("yesScreen");

let envelopeOpened = false;

envelope.addEventListener("click", () => {
  envelope.classList.toggle("open");
  envelopeOpened = true;
});

aweejYesBtn.addEventListener("click", (e) => {
  e.stopPropagation(); // prevents clicking the button from toggling the envelope
  if (!envelopeOpened) envelope.classList.add("open");

  introScreen.classList.remove("active");
  askScreen.classList.add("active");
});

aweejNoBtn.addEventListener("click", function () {
  alert("Access denied. Only aweej allowed 😤");
});

aweejYesBtn.addEventListener("click", function () {
  introScreen.classList.remove("active");
  askScreen.classList.add("active");
});


yesBtn.addEventListener("click", function () {
  askScreen.classList.remove("active");
  yesScreen.classList.add("active");
   startConfetti(3500); // 3.5 seconds
});

let noClicks = 0;

const noMessages = [
  "No 🥺💔",
  "please why 😭",
  "think again 🙃",
  "are you sure?? 😤",
  "don’t do this to me 🥺",
  "okay you’re mean 😭",
  "YES is right there 👉💖"
];
let lastPos = { x: null, y: null };

function rectsOverlap(a, b) {
  return a.right > b.left && a.left < b.right && a.bottom > b.top && a.top < b.bottom;
}

function moveNoButton() {
  const container = noBtn.closest(".button-area");
  if (!container) return;

  // after first move, use pixel positioning (prevents translate weirdness)
  noBtn.style.transform = "none";

  const c = container.getBoundingClientRect();
  const n = noBtn.getBoundingClientRect();
  const yb = yesBtn.getBoundingClientRect();

  const maxX = Math.max(0, c.width - n.width);
  const maxY = Math.max(0, c.height - n.height);

  // If container is 0-sized (hidden), bail safely
  if (maxX === 0 && maxY === 0) return;

  let x = 0, y = 0;

  for (let tries = 0; tries < 80; tries++) {
    x = Math.random() * maxX;
    y = Math.random() * maxY;

    // dramatic: avoid tiny hops
    if (lastPos.x !== null && Math.hypot(x - lastPos.x, y - lastPos.y) < 170) continue;

    const future = {
      left: c.left + x,
      top: c.top + y,
      right: c.left + x + n.width,
      bottom: c.top + y + n.height,
    };

    if (rectsOverlap(future, yb)) continue;

    // found a good spot
    lastPos = { x, y };
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
    return;
  }

  // fallback if somehow no good spot found
  noBtn.style.left = maxX + "px";
  noBtn.style.top = Math.random() * maxY + "px";
}

noBtn.addEventListener("click", function () {
  noClicks++;
  const messageIndex = Math.min(noClicks, noMessages.length - 1);
  noBtn.textContent = noMessages[messageIndex];
  moveNoButton();
});

const heartsLayer = document.getElementById("heartsLayer");

function spawnHeart() {
  const heart = document.createElement("div");
  heart.className = "heart";

  const hearts = ["💖", "💗", "💕", "💘", "💝"];
  heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

  // random horizontal position
  heart.style.left = Math.random() * 100 + "vw";

  // random size
  const size = 14 + Math.random() * 22;
  heart.style.fontSize = size + "px";

  // random duration
  const duration = 4 + Math.random() * 4; // 4–8s
  heart.style.animationDuration = duration + "s";

  // random drift + spin
  heart.style.setProperty("--drift", (Math.random() * 120 - 60).toFixed(0) + "px");
  heart.style.setProperty("--spin", (Math.random() * 80 - 40).toFixed(0) + "deg");

  heartsLayer.appendChild(heart);

  setTimeout(() => heart.remove(), duration * 1000);
}

// hearts only on first screen
setInterval(() => {
  if (askScreen.classList.contains("active")) spawnHeart();
}, 350);

const confettiCanvas = document.getElementById("confettiCanvas");
const confettiCtx = confettiCanvas.getContext("2d");

function sizeConfettiCanvas() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
window.addEventListener("resize", sizeConfettiCanvas);
sizeConfettiCanvas();

let confettiPieces = [];
let confettiAnimId = null;
let confettiEndTime = 0;

const whites = [
  "rgba(255,255,255,0.95)",
  "rgba(255,245,250,0.9)",
  "rgba(255,240,245,0.85)",
  "rgba(255,230,240,0.8)"
];

function makeConfettiPiece() {
  return {
    x: Math.random() * confettiCanvas.width,
    y: -20 - Math.random() * confettiCanvas.height * 0.2,
    w: 6 + Math.random() * 8,
    h: 8 + Math.random() * 14,
    vx: -1.5 + Math.random() * 3,
    vy: 2 + Math.random() * 4.5,
    rot: Math.random() * Math.PI * 2,
    vr: -0.15 + Math.random() * 0.3,
   color: whites[Math.floor(Math.random() * whites.length)]
  };
}

function startConfetti(durationMs = 3500) {
  sizeConfettiCanvas();

  confettiPieces = Array.from({ length: 220 }, makeConfettiPiece);
  confettiEndTime = Date.now() + durationMs;

  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);

  function frame() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    // stop after duration (but let pieces finish falling a bit)
    const keepGoing = Date.now() < confettiEndTime;

    confettiPieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      // simple gravity-ish acceleration
      p.vy += 0.02;

      // wrap horizontally
      if (p.x < -30) p.x = confettiCanvas.width + 30;
      if (p.x > confettiCanvas.width + 30) p.x = -30;

      confettiCtx.save();
      confettiCtx.translate(p.x, p.y);
      confettiCtx.rotate(p.rot);
      confettiCtx.fillStyle = p.color;
      confettiCtx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      confettiCtx.shadowBlur = 8;
      confettiCtx.shadowColor = "rgba(255, 211, 232, 0.8)";
      confettiCtx.restore();
    });

    // respawn a few while running for a “burst”
    if (keepGoing) {
      for (let i = 0; i < 6; i++) confettiPieces.push(makeConfettiPiece());
      // keep array from growing forever
      if (confettiPieces.length > 500) confettiPieces.splice(0, confettiPieces.length - 500);
    }

    // clean up pieces that fell far below if we’re ending
    confettiPieces = confettiPieces.filter((p) => p.y < confettiCanvas.height + 80);

    if (keepGoing || confettiPieces.length > 0) {
      confettiAnimId = requestAnimationFrame(frame);
    } else {
      stopConfetti();
    }
  }

  frame();
}

function stopConfetti() {
  if (confettiAnimId) cancelAnimationFrame(confettiAnimId);
  confettiAnimId = null;
  confettiPieces = [];
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

