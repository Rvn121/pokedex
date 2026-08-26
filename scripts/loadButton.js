"use strict";

const loadBackgroundEyes = document.querySelectorAll(".load-background-eye");

let loadButtonTimer;

// Registriert die Ereignisse für Hover, Klick und Mausbewegung am Load-More-Button.
function initLoadButton() {
  loadButtonStage.addEventListener("mouseenter", openLoadButtonPeek);
  loadMoreButton.addEventListener("click", closeLoadButtonPeek);
  document.addEventListener("mousemove", watchMouseNearLoadButton);
}

// Öffnet den Hover-Effekt mit den Augen und schließt ihn nach zwei Sekunden automatisch.
function openLoadButtonPeek() {
  if (loadMoreButton.disabled) return;
  clearTimeout(loadButtonTimer);
  loadButtonStage.classList.add("peek-active");
  loadButtonTimer = setTimeout(closeLoadButtonPeek, 2000);
}

// Beendet den Hover-Effekt und setzt beide Augen wieder in die Ausgangsposition.
function closeLoadButtonPeek() {
  clearTimeout(loadButtonTimer);
  loadButtonStage.classList.remove("peek-active");
  resetLoadButtonEyes();
}

// Prüft die Mausposition und lässt die Augen nur im direkten Umfeld des Buttons folgen.
function watchMouseNearLoadButton(event) {
  if (!loadButtonStage.classList.contains("peek-active")) return;
  if (!isMouseNearLoadButton(event)) return resetLoadButtonEyes();
  loadBackgroundEyes.forEach((eye) => followMouseWithEye(eye, event));
}

// Prüft, ob sich die Maus innerhalb des festgelegten Bereichs um den Button befindet.
function isMouseNearLoadButton(event) {
  const rect = loadButtonStage.getBoundingClientRect();
  const nearX = event.clientX > rect.left - 280 && event.clientX < rect.right + 280;
  const nearY = event.clientY > rect.top - 280 && event.clientY < rect.bottom + 280;
  return nearX && nearY;
}

// Berechnet die Mausabweichung zu einem Auge und verschiebt dessen Pupille passend dazu.
function followMouseWithEye(eye, event) {
  const rect = eye.getBoundingClientRect();
  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);
  applyPupilPosition(eye, limitEyeMove(x), limitEyeMove(y));
}

// Begrenzt die Bewegung einer Pupille auf maximal sieben Pixel.
function limitEyeMove(value) {
  const move = value / 20;
  return Math.max(-7, Math.min(7, move));
}

// Setzt die berechnete X- und Y-Position einer Pupille per CSS-Transform.
function applyPupilPosition(eye, x, y) {
  const pupil = eye.querySelector(".load-background-pupil");
  pupil.style.transform =
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

// Setzt alle Pupillen des Load-More-Buttons auf ihre Ausgangsposition zurück.
function resetLoadButtonEyes() {
  loadBackgroundEyes.forEach(resetLoadButtonEye);
}

// Setzt die Pupille eines einzelnen Auges wieder genau in die Mitte.
function resetLoadButtonEye(eye) {
  const pupil = eye.querySelector(".load-background-pupil");
  pupil.style.transform = "translate(-50%, -50%)";
}
