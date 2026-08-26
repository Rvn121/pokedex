"use strict";

const previousEvolutionButton = document.getElementById("previousEvolutionButton");
const nextEvolutionButton = document.getElementById("nextEvolutionButton");
const evolutionChainList = document.getElementById("evolutionChainList");
const evolutionStatus = document.getElementById("evolutionStatus");

// Verknüpft die Buttons für vorherige und nächste Evolution mit ihren Klick-Ereignissen.
function initEvolution() {
  previousEvolutionButton.addEventListener("click", openEvolutionFromButton);
  nextEvolutionButton.addEventListener("click", openEvolutionFromButton);
}

// Liest die Evolutions-ID aus einem Navigationsbutton und öffnet das passende Pokémon.
function openEvolutionFromButton(event) {
  const id = Number(event.currentTarget.dataset.evolutionId);
  if (id) openEvolutionPokemon(id);
}

// Fügt allen angezeigten Evolutionskarten ein Klick-Ereignis hinzu.
function addEvolutionCardEvents() {
  const buttons = evolutionChainList.querySelectorAll("[data-evolution-id]");
  buttons.forEach((button) => button.addEventListener("click", openEvolutionCard));
}

// Öffnet das Pokémon, dessen Evolutionskarte angeklickt wurde.
function openEvolutionCard(event) {
  const id = Number(event.currentTarget.dataset.evolutionId);
  openEvolutionPokemon(id);
}

// Lädt das vorherige, nächste und alle Pokémon der Evolutionskette für die Detailansicht vor.
async function preparePokemonRelations(pokemon) {
  await loadNeighborPokemon(pokemon.id);
  const evolution = await getPokemonEvolution(pokemon.id);
  await loadEvolutionPokemonList(evolution);
}

// Lädt die direkten ID-Nachbarn eines Pokémon und legt sie im Cache ab.
async function loadNeighborPokemon(id) {
  const ids = getNeighborPokemonIds(id);
  for (const pokemonId of ids) {
    await loadPokemonById(pokemonId);
  }
}

// Ermittelt die vorherige und nächste gültige Pokémon-ID.
function getNeighborPokemonIds(id) {
  const ids = [];
  if (id > 1) ids.push(id - 1);
  if (id < MAX_POKEMON) ids.push(id + 1);
  return ids;
}

// Lädt alle Pokémon einer Evolutionskette in die lokale Datenbank.
async function loadEvolutionPokemonList(evolution) {
  for (const item of evolution) {
    await loadPokemonById(item.id);
  }
}

// Lädt die Evolution des aktuellen Pokémon und aktualisiert anschließend den Evolution-Bereich.
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

// Setzt den Evolution-Bereich in einen Ladezustand zurück und deaktiviert die Navigation.
function resetEvolutionSection() {
  evolutionStatus.textContent = "Loading evolution data...";
  evolutionChainList.innerHTML = "";
  setEvolutionButton(previousEvolutionButton, null);
  setEvolutionButton(nextEvolutionButton, null);
}

// Nimmt die Evolution aus dem Cache oder lädt Species- und Evolution-Chain-Daten über die API.
async function getPokemonEvolution(id) {
  const savedEvolution = getEvolutionFromDatabase(id);
  if (savedEvolution) return savedEvolution;
  const species = await fetchJson(SPECIES_URL + id);
  const evolutionData = await fetchJson(species.evolution_chain.url);
  return savePreparedEvolution(evolutionData.chain);
}

// Bereitet eine rohe Evolutionskette auf, speichert sie und gibt sie zurück.
function savePreparedEvolution(chain) {
  const evolution = prepareEvolutionChain(chain);
  saveEvolutionChain(evolution);
  return evolution;
}

// Durchläuft die API-Evolutionsstruktur und erstellt daraus ein einfaches Array.
function prepareEvolutionChain(chain) {
  const queue = [{ link: chain, previousId: null }];
  const evolution = [];
  while (queue.length > 0) addEvolutionLink(queue, evolution);
  return evolution;
}

// Verarbeitet einen Eintrag der Evolutionsstruktur und fügt ihn der Ergebnisliste hinzu.
function addEvolutionLink(queue, evolution) {
  const current = queue.shift();
  const id = getIdFromUrl(current.link.species.url);
  const nextIds = current.link.evolves_to.map(getEvolutionId);
  evolution.push(getEvolutionItem(current, id, nextIds));
  addNextEvolutionLinks(queue, current.link.evolves_to, id);
}

// Erstellt ein vereinfachtes Evolutionsobjekt mit ID, Name sowie vorheriger und nächster Evolution.
function getEvolutionItem(current, id, nextIds) {
  return {
    id: id,
    name: current.link.species.name,
    previousId: current.previousId,
    nextIds: nextIds,
  };
}

// Fügt alle nächsten Evolutionsschritte zur Warteschlange hinzu.
function addNextEvolutionLinks(queue, nextLinks, previousId) {
  nextLinks.forEach((link) => addNextEvolutionLink(queue, link, previousId));
}

// Fügt einen einzelnen nächsten Evolutionsschritt mit seiner vorherigen ID zur Warteschlange hinzu.
function addNextEvolutionLink(queue, link, previousId) {
  queue.push({
    link: link,
    previousId: previousId,
  });
}

// Liest die Pokémon-ID aus einem einzelnen Evolutionseintrag aus.
function getEvolutionId(link) {
  return getIdFromUrl(link.species.url);
}

// Liest die letzte Zahl einer PokéAPI-URL aus und gibt sie als ID zurück.
function getIdFromUrl(url) {
  const parts = url.split("/").filter((part) => part);
  return Number(parts[parts.length - 1]);
}

// Zeigt die Evolutionskette an, aktualisiert die Buttons und setzt Klick-Ereignisse.
function renderEvolutionSection(currentId, evolution) {
  evolutionStatus.textContent = "Select an evolution to open it.";
  evolutionChainList.innerHTML = getEvolutionHtml(currentId, evolution);
  updateEvolutionButtons(currentId, evolution);
  addEvolutionCardEvents();
}

// Erstellt die HTML-Ausgabe aller Pokémon einer Evolutionskette.
function getEvolutionHtml(currentId, evolution) {
  return evolution.map((item) => getEvolutionTemplate(item, currentId)).join("");
}

// Ermittelt die möglichen Evolutionsrichtungen des aktuellen Pokémon und aktualisiert die Buttons.
function updateEvolutionButtons(currentId, evolution) {
  const index = evolution.findIndex((item) => item.id === currentId);
  if (index === -1) return;
  setEvolutionButton(previousEvolutionButton, evolution[index].previousId);
  setNextEvolutionButton(evolution[index].nextIds);
}

// Setzt den Button für die nächste Evolution oder fordert bei Verzweigungen eine Auswahl.
function setNextEvolutionButton(nextIds) {
  if (nextIds.length === 1) return setEvolutionButton(nextEvolutionButton, nextIds[0]);
  setEvolutionButton(nextEvolutionButton, null);
  if (nextIds.length > 1) nextEvolutionButton.textContent = "Choose Evolution";
}

// Speichert eine Evolutions-ID am Button und aktiviert oder deaktiviert ihn passend dazu.
function setEvolutionButton(button, id) {
  button.dataset.evolutionId = id || "";
  button.disabled = !id;
  button.textContent = getEvolutionButtonText(button);
}

// Gibt den passenden Text für den vorherigen oder nächsten Evolutionsbutton zurück.
function getEvolutionButtonText(button) {
  if (button === previousEvolutionButton) return "Previous Evolution";
  return "Next Evolution";
}

// Startet den Ladevorgang für ein ausgewähltes Evolutions-Pokémon.
async function openEvolutionPokemon(id) {
  startCustomLoading("Loading evolution...");
  try {
    await loadAndOpenEvolution(id);
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

// Lädt das Evolutions-Pokémon, ergänzt die Detail-Liste und zeigt es anschließend an.
async function loadAndOpenEvolution(id) {
  const pokemon = await loadPokemonById(id);
  addDetailPokemon(pokemon);
  currentPokemonIndex = findDetailPokemonIndex(id);
  await preparePokemonRelations(pokemon);
  stopLoading();
  showPokemonDialog();
}

// Zeigt eine Fehlermeldung an, wenn die Evolutionsdaten nicht geladen werden konnten.
function showEvolutionError() {
  evolutionStatus.textContent = "Evolution data could not be loaded.";
  evolutionChainList.innerHTML = "";
  showErrorDialog();
}
