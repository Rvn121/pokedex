"use strict";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchArea = document.getElementById("searchArea");
const searchHelpBubble = document.getElementById("searchHelpBubble");
const searchResultsDialog = document.getElementById("searchResultsDialog");
const searchResultsList = document.getElementById("searchResultsList");
const searchResultsCount = document.getElementById("searchResultsCount");
const closeSearchResultsButton = document.getElementById("closeSearchResultsButton");
const searchErrorDialog = document.getElementById("searchErrorDialog");
const searchErrorMessage = document.getElementById("searchErrorMessage");
const closeSearchErrorButton = document.getElementById("closeSearchErrorButton");
const searchErrorOkButton = document.getElementById("searchErrorOkButton");

let searchHelpTimer;
let returnToSearchResults = false;

// Initialisiert die Ereignisse für Suchfeld, Suchbutton und die beiden Suchdialoge.
function initSearch() {
  addSearchInputEvents();
  addSearchDialogEvents();
}

// Registriert Eingabe-, Klick-, Enter-, Hover- und Fokus-Ereignisse für die Suche.
function addSearchInputEvents() {
  searchInput.addEventListener("input", checkSearchHelp);
  searchButton.addEventListener("click", startPokemonSearch);
  searchInput.addEventListener("keydown", searchWithEnter);
  searchArea.addEventListener("mouseenter", startSearchHelpTimer);
  searchArea.addEventListener("mouseleave", hideSearchHelp);
  searchInput.addEventListener("focus", startSearchHelpTimer);
  searchInput.addEventListener("blur", hideSearchHelp);
}

// Registriert alle Schließen-Ereignisse für Suchergebnis- und Kein-Treffer-Dialog.
function addSearchDialogEvents() {
  closeSearchResultsButton.addEventListener("click", closeSearchResultsDialog);
  searchResultsDialog.addEventListener("click", closeSearchResultsOnBackdrop);
  closeSearchErrorButton.addEventListener("click", closeSearchErrorDialog);
  searchErrorOkButton.addEventListener("click", closeSearchErrorDialog);
  searchErrorDialog.addEventListener("click", closeSearchErrorOnBackdrop);
}

// Blendet den Hinweis aus, sobald mindestens drei Zeichen eingegeben wurden.
function checkSearchHelp() {
  if (getSearchQuery().length >= 3) hideSearchHelp();
}

// Startet den Ein-Sekunden-Timer für die Hilfesprechblase.
function startSearchHelpTimer() {
  clearTimeout(searchHelpTimer);
  searchHelpTimer = setTimeout(showSearchHelp, 1000);
}

// Blendet die Hilfesprechblase ein und aktualisiert ihren ARIA-Zustand.
function showSearchHelp() {
  searchHelpBubble.classList.add("show");
  searchHelpBubble.setAttribute("aria-hidden", "false");
}

// Beendet den Hilfetimer und blendet die Sprechblase wieder aus.
function hideSearchHelp() {
  clearTimeout(searchHelpTimer);
  searchHelpBubble.classList.remove("show");
  searchHelpBubble.setAttribute("aria-hidden", "true");
}

// Startet die Suche mit Enter und verhindert dabei das normale Standardverhalten der Taste.
function searchWithEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  startPokemonSearch();
}

// Prüft die Eingabe, zeigt bei Bedarf den Hinweis und startet sonst die Pokémon-Suche.
async function startPokemonSearch() {
  const query = getSearchQuery();
  if (!isValidSearchQuery(query)) return showSearchRequirement();
  hideSearchHelp();
  startCustomLoading("Searching Pokémon...");
  await runPokemonSearch(query);
}

// Prüft, ob die Sucheingabe mindestens drei Zeichen lang ist.
function isValidSearchQuery(query) {
  return query.length >= 3;
}

// Zeigt die Hilfesprechblase sofort und blendet sie nach einigen Sekunden wieder aus.
function showSearchRequirement() {
  showSearchHelp();
  clearTimeout(searchHelpTimer);
  searchHelpTimer = setTimeout(hideSearchHelp, 3500);
}

// Führt die Suche aus und öffnet Treffer oder Fehlerdialog abhängig vom Ergebnis.
async function runPokemonSearch(query) {
  try {
    const results = await findPokemonSearchResults(query);
    if (results.length === 0) return finishEmptySearch();
    openSearchResults(results);
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

// Rendert die Treffer und öffnet anschließend den Suchergebnis-Dialog.
function openSearchResults(results) {
  renderSearchPreview(results);
  stopLoading();
  if (!searchResultsDialog.open) searchResultsDialog.showModal();
}

// Erstellt die Vorschaukarten der Suchtreffer und aktualisiert die Trefferanzahl.
function renderSearchPreview(results) {
  detailPokemon = results;
  searchResultsList.innerHTML = results.map(getPokemonCardTemplate).join("");
  searchResultsCount.textContent = getSearchResultCountText(results.length);
  addSearchPreviewCardEvents();
}

// Fügt allen Vorschaukarten im Suchergebnis ein Klick-Ereignis hinzu.
function addSearchPreviewCardEvents() {
  const cards = searchResultsList.querySelectorAll('[data-id="card"]');
  cards.forEach((card) => card.addEventListener("click", openSearchPreviewCard));
}

// Erstellt den passenden Text für einen oder mehrere gefundene Suchtreffer.
function getSearchResultCountText(amount) {
  if (amount === 1) return "1 matching Pokémon found";
  return `${amount} matching Pokémon found`;
}

// Merkt sich die Rückkehr zum Suchergebnis und öffnet die angeklickte Vorschau in der Detailansicht.
async function openSearchPreviewCard(event) {
  returnToSearchResults = true;
  hideSearchResultsDialog();
  await openSearchPokemonDetail(Number(event.currentTarget.dataset.pokemonId));
}

// Setzt das ausgewählte Such-Pokémon und startet den Ladevorgang für seine Detailansicht.
async function openSearchPokemonDetail(id) {
  currentPokemonIndex = findDetailPokemonIndex(id);
  startCustomLoading("Loading Pokémon details...");
  await prepareSearchDetail();
}

// Lädt Nachbarn und Evolutionen des Suchtreffers und öffnet danach die Detailansicht.
async function prepareSearchDetail() {
  try {
    await preparePokemonRelations(getCurrentPokemon());
    stopLoading();
    showPokemonDialog();
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

// Beendet den Ladescreen und zeigt den Kein-Treffer-Dialog an.
function finishEmptySearch() {
  stopLoading();
  showSearchNotFoundDialog();
}

// Entscheidet anhand der Eingabe, ob nach ID oder nach Pokémon-Namen gesucht wird.
async function findPokemonSearchResults(query) {
  if (isNumberSearch(query)) return searchPokemonNumber(query);
  return searchPokemonName(query);
}

// Prüft, ob die Suchanfrage als Zahl interpretiert werden kann.
function isNumberSearch(query) {
  return !isNaN(query);
}

// Sucht ein einzelnes Pokémon anhand einer gültigen ID zwischen 1 und 1025.
async function searchPokemonNumber(query) {
  const id = Number(query);
  if (id < 1 || id > MAX_POKEMON) return [];
  return [await loadPokemonById(id)];
}

// Sucht im Namensindex nach allen Pokémon, deren Name die eingegebene Zeichenfolge enthält.
async function searchPokemonName(query) {
  const searchIndex = await getPokemonSearchIndex();
  const matches = searchIndex.filter((pokemon) => pokemon.name.includes(query));
  return await loadSearchMatches(matches);
}

// Nimmt den Suchindex aus dem Cache oder lädt einmalig alle Namen und IDs von der PokéAPI.
async function getPokemonSearchIndex() {
  const savedIndex = getSearchIndex();
  if (savedIndex.length > 0) return savedIndex;
  const data = await fetchJson(`${API_URL}?limit=${MAX_POKEMON}&offset=0`);
  const searchIndex = prepareSearchIndex(data.results);
  saveSearchIndex(searchIndex);
  return searchIndex;
}

// Bereitet die API-Suchergebnisse auf und entfernt IDs oberhalb von 1025.
function prepareSearchIndex(results) {
  return results.map(getSearchIndexItem)
    .filter((pokemon) => pokemon.id <= MAX_POKEMON);
}

// Erstellt aus einem API-Sucheintrag ein einfaches Objekt aus ID und Name.
function getSearchIndexItem(pokemon) {
  return {
    id: getSearchIdFromUrl(pokemon.url),
    name: pokemon.name,
  };
}

// Liest die Pokémon-ID aus der URL eines Suchindex-Eintrags aus.
function getSearchIdFromUrl(url) {
  const parts = url.split("/").filter((part) => part);
  return Number(parts[parts.length - 1]);
}

// Lädt alle gefundenen Suchtreffer nacheinander und gibt die vollständigen Pokémon-Daten zurück.
async function loadSearchMatches(matches) {
  const pokemon = [];
  for (const match of matches) {
    pokemon.push(await loadPokemonById(match.id));
  }
  return pokemon;
}

// Liest den Suchtext aus, entfernt Leerzeichen am Rand und wandelt ihn in Kleinbuchstaben um.
function getSearchQuery() {
  return searchInput.value.trim().toLowerCase();
}

// Beendet den Rückkehrmodus und schließt den Suchergebnis-Dialog.
function closeSearchResultsDialog() {
  returnToSearchResults = false;
  hideSearchResultsDialog();
}

// Schließt den Suchergebnis-Dialog, wenn er gerade geöffnet ist.
function hideSearchResultsDialog() {
  if (searchResultsDialog.open) searchResultsDialog.close();
}

// Öffnet nach dem Schließen einer Detailansicht wieder das vorherige Suchergebnis.
function reopenSearchResultsAfterDetail() {
  if (!returnToSearchResults) return;
  if (!searchResultsDialog.open) searchResultsDialog.showModal();
}

// Schließt das Suchergebnis, wenn direkt auf den Hintergrund neben dem Dialog geklickt wird.
function closeSearchResultsOnBackdrop(event) {
  if (event.target === searchResultsDialog) closeSearchResultsDialog();
}

// Fügt die Kein-Treffer-Meldung ein und öffnet den dazugehörigen Dialog.
function showSearchNotFoundDialog() {
  searchErrorMessage.innerHTML = getNotFoundTemplate();
  if (!searchErrorDialog.open) searchErrorDialog.showModal();
}

// Schließt den Kein-Treffer-Dialog.
function closeSearchErrorDialog() {
  searchErrorDialog.close();
}

// Schließt den Kein-Treffer-Dialog bei einem Klick neben den Dialoginhalt.
function closeSearchErrorOnBackdrop(event) {
  if (event.target === searchErrorDialog) closeSearchErrorDialog();
}
