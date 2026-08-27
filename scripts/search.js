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

// Rendert die Treffer, sperrt den Hintergrund und öffnet den Suchergebnis-Dialog.
function openSearchResults(results) {
  renderSearchPreview(results);
  stopLoading();
  lockSearchResultPage();
  searchResultsDialog.showModal();
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
  await openSearchPokemonDetail(Number(event.currentTarget.getAttribute("data-pokemon-id")));
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

// Prüft, ob die Suchanfrage nur aus Zahlen besteht.
function isNumberSearch(query) {
  for (let i = 0; i < query.length; i++) {
    if (!isSearchNumber(query.charAt(i))) return false;
  }
  return query.length > 0;
}

// Prüft, ob ein einzelnes Zeichen eine Zahl von 0 bis 9 ist.
function isSearchNumber(character) {
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return numbers.findIndex((number) => number === character) !== -1;
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
  const matches = searchIndex.filter((pokemon) => pokemonNameMatches(pokemon.name, query));
  return await loadSearchMatches(matches);
}

// Prüft, ob der Suchtext irgendwo im Pokémon-Namen vorkommt.
function pokemonNameMatches(name, query) {
  for (let start = 0; start <= name.length - query.length; start++) {
    if (textMatchesAtPosition(name, query, start)) return true;
  }
  return false;
}

// Vergleicht den Suchtext Zeichen für Zeichen ab einer bestimmten Position.
function textMatchesAtPosition(name, query, start) {
  for (let i = 0; i < query.length; i++) {
    if (name.charAt(start + i) !== query.charAt(i)) return false;
  }
  return true;
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
  return getIdFromApiUrl(url);
}

// Lädt alle gefundenen Suchtreffer nacheinander und gibt die vollständigen Pokémon-Daten zurück.
async function loadSearchMatches(matches) {
  const pokemon = [];
  for (const match of matches) {
    pokemon.push(await loadPokemonById(match.id));
  }
  return pokemon;
}

// Liest den Suchtext aus, entfernt Leerzeichen am Rand und schreibt ihn klein.
function getSearchQuery() {
  const text = trimSearchText(searchInput.value);
  return convertSearchTextToLowerCase(text);
}

// Entfernt Leerzeichen am Anfang und Ende des Suchtextes.
function trimSearchText(text) {
  let start = 0;
  let end = text.length - 1;
  while (start < text.length && text.charAt(start) === " ") start++;
  while (end >= start && text.charAt(end) === " ") end--;
  return getSearchTextPart(text, start, end);
}

// Baut den Suchtext zwischen Start- und Endposition neu zusammen.
function getSearchTextPart(text, start, end) {
  let result = "";
  for (let i = start; i <= end; i++) result += text.charAt(i);
  return result;
}

// Wandelt Großbuchstaben im Suchtext mit einfachen Arrays in Kleinbuchstaben um.
function convertSearchTextToLowerCase(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += getLowerCaseLetter(text.charAt(i));
  }
  return result;
}

// Gibt für einen Großbuchstaben den passenden Kleinbuchstaben zurück.
function getLowerCaseLetter(letter) {
  const upper = getUpperCaseLetters();
  const lower = getLowerCaseLetters();
  const index = upper.findIndex((item) => item === letter);
  if (index === -1) return letter;
  return lower[index];
}

// Gibt alle Großbuchstaben zurück, die für die Suche benötigt werden.
function getUpperCaseLetters() {
  return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
}

// Gibt alle Kleinbuchstaben zurück, die zu den Großbuchstaben gehören.
function getLowerCaseLetters() {
  return ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
}

// Beendet den Rückkehrmodus und schließt den Suchergebnis-Dialog.
function closeSearchResultsDialog() {
  returnToSearchResults = false;
  hideSearchResultsDialog();
}

// Schließt den Suchergebnis-Dialog und gibt den Hintergrund wieder zum Scrollen frei.
function hideSearchResultsDialog() {
  searchResultsDialog.close();
  unlockSearchResultPage();
}

// Öffnet nach dem Schließen einer Detailansicht wieder das vorherige Suchergebnis.
function reopenSearchResultsAfterDetail() {
  if (!returnToSearchResults) return;
  lockSearchResultPage();
  searchResultsDialog.showModal();
}

// Sperrt den Seitenhintergrund, solange das Suchergebnis geöffnet ist.
function lockSearchResultPage() {
  document.body.style.overflow = "hidden";
}

// Gibt den Seitenhintergrund nach dem Schließen des Suchergebnisses wieder frei.
function unlockSearchResultPage() {
  document.body.style.overflow = "";
}

// Schließt das Suchergebnis, wenn direkt auf den Hintergrund neben dem Dialog geklickt wird.
function closeSearchResultsOnBackdrop(event) {
  if (event.target === searchResultsDialog) closeSearchResultsDialog();
}

// Fügt die Kein-Treffer-Meldung ein und öffnet den dazugehörigen Dialog.
function showSearchNotFoundDialog() {
  searchErrorMessage.innerHTML = getNotFoundTemplate();
  searchErrorDialog.showModal();
}

// Schließt den Kein-Treffer-Dialog.
function closeSearchErrorDialog() {
  searchErrorDialog.close();
}

// Schließt den Kein-Treffer-Dialog bei einem Klick neben den Dialoginhalt.
function closeSearchErrorOnBackdrop(event) {
  if (event.target === searchErrorDialog) closeSearchErrorDialog();
}
