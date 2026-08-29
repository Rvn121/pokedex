"use strict";

/** DE: Verknüpft den Load-More-Button mit der Funktion zum Nachladen weiterer Pokémon. | EN: Connects the Load More button with the function that loads additional Pokémon. */
function initLoadMore() {
  loadMoreButton.addEventListener("click", loadSelectedPokemonAmount);
}

/** DE: Initialisiert die Datenbank und lädt entweder vorhandene Content-Daten oder die ersten 20 Pokémon. | EN: Initializes the database and loads saved content data or the first 20 Pokémon. */
async function preparePokemonPage() {
  try {
    await initDatabase();
    if (getContentIds().length > 0) return renderDatabase();
    await loadPokemonAmount(START_AMOUNT);
  } catch (error) {
    showErrorDialog();
  }
}

/** DE: Liest die ausgewählte Menge aus dem Dropdown und startet das Nachladen. | EN: Reads the selected amount from the dropdown and starts loading more Pokémon. */
async function loadSelectedPokemonAmount() {
  await loadPokemonAmount(loadCountSelect.value);
}

/** DE: Ermittelt die noch fehlenden IDs und lädt die gewünschte Anzahl Pokémon. | EN: Determines the missing IDs and loads the requested number of Pokémon. */
async function loadPokemonAmount(amount) {
  if (isLoading) return;
  const ids = getMissingPokemonIds(amount);
  if (ids.length === 0) return updateLoadControls();
  await runPokemonLoading(ids);
}

/**DE: Lädt Pokémon, speichert die IDs und aktualisiert die Kartenansicht. | EN: Loads Pokémon, saves the IDs and updates the card view. */
async function runPokemonLoading(ids) {
  startLoading(ids.length);
  try {
    await loadPokemonIds(ids);
    saveContentIds(ids);
    renderDatabase();
  } catch (error) {
    console.error(error);
    showErrorDialog();
  } finally {
    stopLoading();
  }
}

/** DE: Lädt alle übergebenen Pokémon-IDs nacheinander und sammelt die Ergebnisse in einem Array. | EN: Loads all provided Pokémon IDs one after another and collects the results in an array. */
async function loadPokemonIds(ids) {
  for (const id of ids) {
    await loadPokemonById(id);
  }
}

/** DE: Ermittelt die nächsten IDs, die noch nicht im normalen Contentbereich geladen wurden. | EN: Determines the next IDs that have not yet been loaded into the normal content area. */
function getMissingPokemonIds(amount) {
  const ids = [];
  const contentIds = getContentIds();
  for (let id = 1; id <= MAX_POKEMON; id++) {
    if (findIdInList(contentIds, id) === -1) ids.push(id);
    if (hasEnoughIds(ids, amount)) break;
  }
  return ids;
}

/** DE: Sucht eine ID in einer einfachen ID-Liste. | EN: Finds an ID in a simple ID list. */
function findIdInList(ids, id) {
  return ids.findIndex((savedId) => savedId === id);
}

/** DE: Prüft, ob bereits genügend IDs für die ausgewählte Nachlademenge gesammelt wurden. | EN: Checks whether enough IDs have been collected for the selected load amount. */
function hasEnoughIds(ids, amount) {
  return ids.length >= Number(amount);
}

/** DE: Liest die Content-Pokémon aus der Datenbank und rendert daraus die Karten im Hauptbereich. | EN: Reads the content Pokémon from the database and renders their cards in the main area. */
function renderDatabase() {
  renderedPokemon = getContentPokemonFromDatabase();
  pokemonList.innerHTML = renderedPokemon.map(getPokemonCardTemplate).join("");
  addCardEvents();
  updateLoadedCounter();
  updateLoadControls();
}

/** DE: Startet den Ladescreen mit einem Text passend zur Anzahl der zu ladenden Pokémon. | EN: Starts the loading screen with text that matches the number of Pokémon being loaded. */
function startLoading(amount) {
  startCustomLoading(`Loading ${amount} Pokémon...`);
}

/** DE: Startet den Ladescreen mit einem frei übergebenen Hinweistext. | EN: Starts the loading screen with a custom information text. */
function startCustomLoading(text) {
  isLoading = true;
  setLoadControlsDisabled(true);
  loadingText.textContent = text;
  loadingScreen.classList.add("show");
  loadingScreen.setAttribute("aria-hidden", "false");
}

/** DE: Beendet den Ladescreen und aktualisiert anschließend den Zustand der Ladeelemente. | EN: Stops the loading screen and updates the state of the load controls. */
function stopLoading() {
  isLoading = false;
  loadingScreen.classList.remove("show");
  loadingScreen.setAttribute("aria-hidden", "true");
  updateLoadControls();
}

/** DE: Aktualisiert die Anzeige, wie viele Pokémon von insgesamt 1025 im Content geladen sind. | EN: Updates the display showing how many of the 1025 Pokémon are loaded in the content area. */
function updateLoadedCounter() {
  const amount = getContentIds().length;
  loadedCounter.textContent = `${amount} of ${MAX_POKEMON} Pokémon loaded`;
}

/** DE: Prüft, ob gerade geladen wird oder alle Pokémon geladen sind, und setzt die Bedienelemente entsprechend. | EN: Checks whether loading is active or all Pokémon are loaded and updates the controls. */
function updateLoadControls() {
  const allLoaded = getContentIds().length >= MAX_POKEMON;
  setLoadControlsDisabled(allLoaded || isLoading);
}

/** DE: Aktiviert oder deaktiviert Load-More-Button und Mengen-Dropdown gemeinsam. | EN: Enables or disables the Load More button and amount dropdown together. */
function setLoadControlsDisabled(disabled) {
  loadMoreButton.disabled = disabled;
  loadCountSelect.disabled = disabled;
}
