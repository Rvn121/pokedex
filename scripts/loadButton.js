"use strict";

const loadBackgroundEyes = document.querySelectorAll(".load-background-eye");

let loadButtonTimer;

function initLoadButton() {
  loadButtonStage.addEventListener("mouseenter", openLoadButtonPeek);
  loadMoreButton.addEventListener("click", closeLoadButtonPeek);
  document.addEventListener("mousemove", watchMouseNearLoadButton);
}

function openLoadButtonPeek() {
  if (loadMoreButton.disabled) return;
  clearTimeout(loadButtonTimer);
  loadButtonStage.classList.add("peek-active");
  loadButtonTimer = setTimeout(closeLoadButtonPeek, 2000);
}

function closeLoadButtonPeek() {
  clearTimeout(loadButtonTimer);
  loadButtonStage.classList.remove("peek-active");
  resetLoadButtonEyes();
}

function watchMouseNearLoadButton(event) {
  if (!loadButtonStage.classList.contains("peek-active")) return;
  if (!isMouseNearLoadButton(event)) return resetLoadButtonEyes();
  loadBackgroundEyes.forEach((eye) => followMouseWithEye(eye, event));
}

function isMouseNearLoadButton(event) {
  const rect = loadButtonStage.getBoundingClientRect();
  const nearX = event.clientX > rect.left - 280 && event.clientX < rect.right + 280;
  const nearY = event.clientY > rect.top - 280 && event.clientY < rect.bottom + 280;
  return nearX && nearY;
}

function followMouseWithEye(eye, event) {
  const rect = eye.getBoundingClientRect();
  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);
  applyPupilPosition(eye, limitEyeMove(x), limitEyeMove(y));
}

function limitEyeMove(value) {
  const move = value / 20;
  return Math.max(-7, Math.min(7, move));
}

function applyPupilPosition(eye, x, y) {
  const pupil = eye.querySelector(".load-background-pupil");
  pupil.style.transform =
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function resetLoadButtonEyes() {
  loadBackgroundEyes.forEach(resetLoadButtonEye);
}

function resetLoadButtonEye(eye) {
  const pupil = eye.querySelector(".load-background-pupil");
  pupil.style.transform = "translate(-50%, -50%)";
}
