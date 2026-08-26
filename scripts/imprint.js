"use strict";

const trainingDialog = document.getElementById("trainingDialog");
const closeTrainingDialogButton = document.getElementById(
  "closeTrainingDialogButton",
);
const trainingDialogOkButton = document.getElementById(
  "trainingDialogOkButton",
);

// Initialisiert die Ereignisse des Schulungs-Hinweises und öffnet den Dialog beim Aufruf des Impressums.
function initImprint() {
  addTrainingDialogEvents();
  trainingDialog.showModal();
}

// Verknüpft OK, Schließen-Icon und Klick neben den Dialog mit der Schließen-Funktion.
function addTrainingDialogEvents() {
  closeTrainingDialogButton.addEventListener("click", closeTrainingDialog);
  trainingDialogOkButton.addEventListener("click", closeTrainingDialog);
  trainingDialog.addEventListener("click", closeTrainingDialogOnBackdrop);
}

// Schließt den Hinweisdialog des Schulungsprojekts.
function closeTrainingDialog() {
  trainingDialog.close();
}

// Schließt den Hinweisdialog, wenn direkt auf den Hintergrund neben dem Inhalt geklickt wird.
function closeTrainingDialogOnBackdrop(event) {
  if (event.target === trainingDialog) {
    closeTrainingDialog();
  }
}

initImprint();
