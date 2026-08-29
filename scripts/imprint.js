"use strict";

const trainingDialog = document.getElementById("trainingDialog");
const closeTrainingDialogButton = document.getElementById(
  "closeTrainingDialogButton",
);
const trainingDialogOkButton = document.getElementById(
  "trainingDialogOkButton",
);

/** DE: Initialisiert die Ereignisse des Schulungs-Hinweises und öffnet den Dialog beim Aufruf des Impressums. | EN: Initializes the training notice events and opens the dialog when the imprint page loads. */
function initImprint() {
  addTrainingDialogEvents();
  trainingDialog.showModal();
}

/** DE: Verknüpft OK, Schließen-Icon und Klick neben den Dialog mit der Schließen-Funktion. | EN: Connects OK, close icon and backdrop click with the dialog close function. */
function addTrainingDialogEvents() {
  closeTrainingDialogButton.addEventListener("click", closeTrainingDialog);
  trainingDialogOkButton.addEventListener("click", closeTrainingDialog);
  trainingDialog.addEventListener("click", closeTrainingDialogOnBackdrop);
}

/** DE: Schließt den Hinweisdialog des Schulungsprojekts. | EN: Closes the training-project information dialog. */
function closeTrainingDialog() {
  trainingDialog.close();
}

/** DE: Schließt den Hinweisdialog, wenn direkt auf den Hintergrund neben dem Inhalt geklickt wird. | EN: Closes the notice dialog when the backdrop beside the content is clicked. */
function closeTrainingDialogOnBackdrop(event) {
  if (event.target === trainingDialog) {
    closeTrainingDialog();
  }
}

initImprint();
