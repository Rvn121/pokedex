"use strict";

const previousEvolutionButton = document.getElementById("previousEvolutionButton");
const nextEvolutionButton = document.getElementById("nextEvolutionButton");
const evolutionChainList = document.getElementById("evolutionChainList");
const evolutionStatus = document.getElementById("evolutionStatus");

/** DE: Verknüpft die Buttons für vorherige und nächste Evolution mit ihren Klick-Ereignissen. | EN: Connects the previous and next evolution buttons with their click events. */
function initEvolution() {
  previousEvolutionButton.addEventListener("click", openEvolutionFromButton);
  nextEvolutionButton.addEventListener("click", openEvolutionFromButton);
}

/** DE: Liest die Evolutions-ID aus einem Navigationsbutton und öffnet das passende Pokémon. | EN: Reads the evolution ID from a navigation button and opens the matching Pokémon. */
function openEvolutionFromButton(event) {
  const id = Number(event.currentTarget.getAttribute("data-evolution-id"));
  if (id) openEvolutionPokemon(id);
}

/** DE: Fügt allen angezeigten Evolutionskarten ein Klick-Ereignis hinzu. | EN: Adds a click event to all displayed evolution cards. */
function addEvolutionCardEvents() {
  const buttons = evolutionChainList.querySelectorAll("[data-evolution-id]");
  buttons.forEach((button) => button.addEventListener("click", openEvolutionCard));
}

/** DE: Öffnet das Pokémon, dessen Evolutionskarte angeklickt wurde. | EN: Opens the Pokémon whose evolution card was clicked. */
function openEvolutionCard(event) {
  const id = Number(event.currentTarget.getAttribute("data-evolution-id"));
  openEvolutionPokemon(id);
}

/** DE: Lädt das vorherige, nächste und alle Pokémon der Evolutionskette für die Detailansicht vor. | EN: Preloads the previous, next and all evolution-chain Pokémon for the detail view. */
async function preparePokemonRelations(pokemon) {
  await loadNeighborPokemon(pokemon.id);
  const evolution = await getPokemonEvolution(pokemon.id);
  await loadEvolutionPokemonList(evolution);
}

/** DE: Lädt die direkten ID-Nachbarn eines Pokémon und legt sie im Cache ab. | EN: Loads the direct ID neighbours of a Pokémon and stores them in the cache. */
async function loadNeighborPokemon(id) {
  const ids = getNeighborPokemonIds(id);
  for (const pokemonId of ids) {
    await loadPokemonById(pokemonId);
  }
}

/** DE: Ermittelt die vorherige und nächste gültige Pokémon-ID. | EN: Determines the previous and next valid Pokémon IDs. */
function getNeighborPokemonIds(id) {
  const ids = [];
  if (id > 1) ids.push(id - 1);
  if (id < MAX_POKEMON) ids.push(id + 1);
  return ids;
}

/** DE: Lädt alle Pokémon einer Evolutionskette in die lokale Datenbank. | EN: Loads all Pokémon of an evolution chain into the local database. */
async function loadEvolutionPokemonList(evolution) {
  for (const item of evolution) {
    await loadPokemonById(item.id);
  }
}

/** DE: Lädt die Evolution des aktuellen Pokémon und aktualisiert anschließend den Evolution-Bereich. | EN: Loads the evolution of the current Pokémon and then updates the evolution section. */
async function updateEvolutionSection(pokemon) {
  resetEvolutionSection();
  try {
    const evolution = await getPokemonEvolution(pokemon.id);
    if (getCurrentPokemon().id !== pokemon.id) return;
    renderEvolutionSection(pokemon.id, evolution);
  } catch (error) {
    showEvolutionError();
  }
}

/** DE: Setzt den Evolution-Bereich in einen Ladezustand zurück und deaktiviert die Navigation. | EN: Resets the evolution section to loading state and disables the navigation. */
function resetEvolutionSection() {
  evolutionStatus.textContent = "Loading evolution data...";
  evolutionChainList.innerHTML = "";
  setEvolutionButton(previousEvolutionButton, null);
  setEvolutionButton(nextEvolutionButton, null);
}

/** DE: Nimmt die Evolution aus dem Cache oder lädt Species- und Evolution-Chain-Daten über die API. | EN: Uses the cached evolution or loads species and evolution-chain data from the API. */
async function getPokemonEvolution(id) {
  const savedEvolution = getEvolutionFromDatabase(id);
  if (savedEvolution) return savedEvolution;
  const species = await fetchJson(SPECIES_URL + id);
  const evolutionData = await fetchJson(species.evolution_chain.url);
  return savePreparedEvolution(evolutionData.chain);
}

/** DE: Bereitet eine rohe Evolutionskette auf, speichert sie und gibt sie zurück. | EN: Prepares a raw evolution chain, stores it and returns it. */
function savePreparedEvolution(chain) {
  const evolution = prepareEvolutionChain(chain);
  saveEvolutionChain(evolution);
  return evolution;
}

/** DE: Durchläuft die API-Evolutionsstruktur und erstellt daraus ein einfaches Array. | EN: Processes the API evolution structure and creates a simple array from it. */
function prepareEvolutionChain(chain) {
  const queue = [{ link: chain, previousId: null }];
  const evolution = [];
  while (queue.length > 0) addEvolutionLink(queue, evolution);
  return evolution;
}

/** DE: Verarbeitet einen Eintrag der Evolutionsstruktur und fügt ihn der Ergebnisliste hinzu. | EN: Processes one evolution entry and adds it to the result list. */
function addEvolutionLink(queue, evolution) {
  const current = queue.shift();
  const id = getIdFromApiUrl(current.link.species.url);
  const nextIds = current.link.evolves_to.map(getEvolutionId);
  evolution.push(getEvolutionItem(current, id, nextIds));
  addNextEvolutionLinks(queue, current.link.evolves_to, id);
}

/** DE: Erstellt ein vereinfachtes Evolutionsobjekt mit ID, Name sowie vorheriger und nächster Evolution. | EN: Creates a simplified evolution object with ID, name, previous and next evolution. */
function getEvolutionItem(current, id, nextIds) {
  return {
    id: id,
    name: current.link.species.name,
    previousId: current.previousId,
    nextIds: nextIds,
  };
}

/** DE: Fügt alle nächsten Evolutionsschritte zur Warteschlange hinzu. | EN: Adds all next evolution steps to the queue. */
function addNextEvolutionLinks(queue, nextLinks, previousId) {
  nextLinks.forEach((link) => addNextEvolutionLink(queue, link, previousId));
}

/** DE: Fügt einen einzelnen nächsten Evolutionsschritt mit seiner vorherigen ID zur Warteschlange hinzu. | EN: Adds one next evolution step with its previous ID to the queue. */
function addNextEvolutionLink(queue, link, previousId) {
  queue.push({
    link: link,
    previousId: previousId,
  });
}

/** DE: Liest die Pokémon-ID aus einem einzelnen Evolutionseintrag aus. | EN: Reads the Pokémon ID from one evolution entry. */
function getEvolutionId(link) {
  return getIdFromApiUrl(link.species.url);
}


/** DE: Zeigt die Evolutionskette an, aktualisiert die Buttons und setzt Klick-Ereignisse. | EN: Displays the evolution chain, updates buttons and adds click events. */
function renderEvolutionSection(currentId, evolution) {
  evolutionStatus.textContent = "Select an evolution to open it.";
  evolutionChainList.innerHTML = getEvolutionHtml(currentId, evolution);
  updateEvolutionButtons(currentId, evolution);
  addEvolutionCardEvents();
}

/** DE: Erstellt die HTML-Ausgabe aller Pokémon einer Evolutionskette. | EN: Creates the HTML output for all Pokémon in an evolution chain. */
function getEvolutionHtml(currentId, evolution) {
  return evolution.map((item) => getEvolutionTemplate(item, currentId)).join("");
}

/** DE: Ermittelt die möglichen Evolutionsrichtungen des aktuellen Pokémon und aktualisiert die Buttons. | EN: Determines possible evolution directions and updates the navigation buttons. */
function updateEvolutionButtons(currentId, evolution) {
  const index = evolution.findIndex((item) => item.id === currentId);
  if (index === -1) return;
  setEvolutionButton(previousEvolutionButton, evolution[index].previousId);
  setNextEvolutionButton(evolution[index].nextIds);
}

/** DE: Setzt den Button für die nächste Evolution oder fordert bei Verzweigungen eine Auswahl. | EN: Sets the next-evolution button or asks for a choice when the chain branches. */
function setNextEvolutionButton(nextIds) {
  if (nextIds.length === 1) return setEvolutionButton(nextEvolutionButton, nextIds[0]);
  setEvolutionButton(nextEvolutionButton, null);
  if (nextIds.length > 1) nextEvolutionButton.textContent = "Choose Evolution";
}

/** DE: Speichert eine Evolutions-ID am Button und aktiviert oder deaktiviert ihn passend dazu. | EN: Stores an evolution ID on the button and enables or disables it as needed. */
function setEvolutionButton(button, id) {
  button.setAttribute("data-evolution-id", id || "");
  button.disabled = !id;
  button.textContent = getEvolutionButtonText(button);
}

/** DE: Gibt den passenden Text für den vorherigen oder nächsten Evolutionsbutton zurück. | EN: Returns the correct text for the previous or next evolution button. */
function getEvolutionButtonText(button) {
  if (button === previousEvolutionButton) return "Previous Evolution";
  return "Next Evolution";
}

/** DE: Startet den Ladevorgang für ein ausgewähltes Evolutions-Pokémon. | EN: Starts loading for a selected evolution Pokémon. */
async function openEvolutionPokemon(id) {
  startCustomLoading("Loading evolution...");
  try {
    await loadAndOpenEvolution(id);
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

/** DE: Lädt das Evolutions-Pokémon, ergänzt die Detail-Liste und zeigt es anschließend an. | EN: Loads the evolution Pokémon, adds it to the detail list and displays it. */
async function loadAndOpenEvolution(id) {
  const pokemon = await loadPokemonById(id);
  addDetailPokemon(pokemon);
  currentPokemonIndex = findDetailPokemonIndex(id);
  await preparePokemonRelations(pokemon);
  stopLoading();
  showPokemonDialog();
}

/** DE: Zeigt eine Fehlermeldung an, wenn die Evolutionsdaten nicht geladen werden konnten. | EN: Displays an error message when evolution data could not be loaded. */
function showEvolutionError() {
  evolutionStatus.textContent = "Evolution data could not be loaded.";
  evolutionChainList.innerHTML = "";
  showErrorDialog();
}
