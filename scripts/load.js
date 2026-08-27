"use strict";

// Verknüpft den Load-More-Button mit der Funktion zum Nachladen weiterer Pokémon.
function initLoadMore() {
  loadMoreButton.addEventListener("click", loadSelectedPokemonAmount);
}

// Initialisiert die Datenbank und lädt entweder vorhandene Content-Daten oder die ersten 20 Pokémon.
async function preparePokemonPage() {
  try {
    await initDatabase();
    if (getContentIds().length > 0) return renderDatabase();
    await loadPokemonAmount(START_AMOUNT);
  } catch (error) {
    showErrorDialog();
  }
}

// Liest die ausgewählte Menge aus dem Dropdown und startet das Nachladen.
async function loadSelectedPokemonAmount() {
  await loadPokemonAmount(loadCountSelect.value);
}

// Ermittelt die noch fehlenden IDs und lädt die gewünschte Anzahl Pokémon.
async function loadPokemonAmount(amount) {
  if (isLoading) return;
  const ids = getMissingPokemonIds(amount);
  if (ids.length === 0) return updateLoadControls();
  await runPokemonLoading(ids);
}

// Steuert den kompletten Ladevorgang inklusive Spinner, Speichern, Rendern und Fehlerbehandlung.
async function runPokemonLoading(ids) {
  startLoading(ids.length);
  try {
    await loadPokemonIds(ids);
    saveContentIds(ids);
    renderDatabase();
    stopLoading();
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

// Lädt alle übergebenen Pokémon-IDs nacheinander und sammelt die Ergebnisse in einem Array.
async function loadPokemonIds(ids) {
  for (const id of ids) {
    await loadPokemonById(id);
  }
}

// Ermittelt die nächsten IDs, die noch nicht im normalen Contentbereich geladen wurden.
function getMissingPokemonIds(amount) {
  const ids = [];
  const contentIds = getContentIds();
  for (let id = 1; id <= MAX_POKEMON; id++) {
    if (findIdInList(contentIds, id) === -1) ids.push(id);
    if (hasEnoughIds(ids, amount)) break;
  }
  return ids;
}

// Sucht eine ID in einer einfachen ID-Liste.
function findIdInList(ids, id) {
  return ids.findIndex((savedId) => savedId === id);
}

// Prüft, ob bereits genügend IDs für die ausgewählte Nachlademenge gesammelt wurden.
function hasEnoughIds(ids, amount) {
  if (amount === "all") return false;
  return ids.length >= Number(amount);
}

// Liest die Content-Pokémon aus der Datenbank und rendert daraus die Karten im Hauptbereich.
function renderDatabase() {
  renderedPokemon = getContentPokemonFromDatabase();
  pokemonList.innerHTML = renderedPokemon.map(getPokemonCardTemplate).join("");
  addCardEvents();
  updateLoadedCounter();
  updateLoadControls();
}

// Startet den Ladescreen mit einem Text passend zur Anzahl der zu ladenden Pokémon.
function startLoading(amount) {
  startCustomLoading(`Loading ${amount} Pokémon...`);
}

// Startet den Ladescreen mit einem frei übergebenen Hinweistext.
function startCustomLoading(text) {
  isLoading = true;
  setLoadControlsDisabled(true);
  loadingText.textContent = text;
  loadingScreen.classList.add("show");
  loadingScreen.setAttribute("aria-hidden", "false");
}

// Beendet den Ladescreen und aktualisiert anschließend den Zustand der Ladeelemente.
function stopLoading() {
  isLoading = false;
  loadingScreen.classList.remove("show");
  loadingScreen.setAttribute("aria-hidden", "true");
  updateLoadControls();
}

// Aktualisiert die Anzeige, wie viele Pokémon von insgesamt 1025 im Content geladen sind.
function updateLoadedCounter() {
  const amount = getContentIds().length;
  loadedCounter.textContent = `${amount} of ${MAX_POKEMON} Pokémon loaded`;
}

// Prüft, ob gerade geladen wird oder alle Pokémon geladen sind, und setzt die Bedienelemente entsprechend.
function updateLoadControls() {
  const allLoaded = getContentIds().length >= MAX_POKEMON;
  setLoadControlsDisabled(allLoaded || isLoading);
}

// Aktiviert oder deaktiviert Load-More-Button und Mengen-Dropdown gemeinsam.
function setLoadControlsDisabled(disabled) {
  loadMoreButton.disabled = disabled;
  loadCountSelect.disabled = disabled;
  setLoadButtonDisabledStyle(disabled);
}

// Setzt den optischen Disabled-Zustand des Load-More-Bereichs und beendet dabei die Augenanimation.
function setLoadButtonDisabledStyle(disabled) {
  if (disabled) loadButtonStage.classList.add("disabled-state");
  if (!disabled) loadButtonStage.classList.remove("disabled-state");
  if (disabled) closeLoadButtonPeek();
}
