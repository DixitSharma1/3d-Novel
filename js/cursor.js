// =========================================
// ELEMENTS
// =========================================

const cursor = document.querySelector(".cursor");
const cursorDot = document.querySelector(".cursor-dot");

// =========================================
// MOUSE POSITION
// =========================================

let mouseX = 0;
let mouseY = 0;

let cursorX = 0;
let cursorY = 0;

// =========================================
// TRACK MOUSE
// =========================================

window.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// =========================================
// SMOOTH FOLLOW (LERP)
// =========================================

function animateCursor() {

  // smooth interpolation (0.12 = smooth cinematic delay)
  cursorX += (mouseX - cursorX) * 0.12;
  cursorY += (mouseY - cursorY) * 0.12;

  // main circle (lagging)
  cursor.style.transform =
    `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;

  // dot (faster follow)
  cursorDot.style.transform =
    `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

  requestAnimationFrame(animateCursor);
}

animateCursor();

// =========================================
// HOVER EFFECTS
// =========================================

const hoverItems = document.querySelectorAll("button, a");

hoverItems.forEach(item => {

  item.addEventListener("mouseenter", () => {

    cursor.style.transform += " scale(1.8)";
    cursor.style.borderColor = "rgba(229,193,88,0.7)";

  });

  item.addEventListener("mouseleave", () => {

    cursor.style.borderColor = "rgba(229,193,88,0.25)";
    cursor.style.transform =
      cursor.style.transform.replace(" scale(1.8)", "");

  });

});


