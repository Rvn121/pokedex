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

/** DE: Initialisiert die Ereignisse für Suchfeld, Suchbutton und die beiden Suchdialoge. | EN: Initializes events for the search field, search button and both search dialogs. */
function initSearch() {
  addSearchInputEvents();
  addSearchDialogEvents();
}

/** DE: Registriert Eingabe-, Klick-, Enter-, Hover- und Fokus-Ereignisse für die Suche. | EN: Registers input, click, Enter, hover and focus events for the search. */
function addSearchInputEvents() {
  searchInput.addEventListener("input", checkSearchHelp);
  searchButton.addEventListener("click", startPokemonSearch);
  searchInput.addEventListener("keydown", searchWithEnter);
  searchArea.addEventListener("mouseenter", startSearchHelpTimer);
  searchArea.addEventListener("mouseleave", hideSearchHelp);
  searchInput.addEventListener("focus", startSearchHelpTimer);
  searchInput.addEventListener("blur", hideSearchHelp);
}

/** DE: Registriert alle Schließen-Ereignisse für Suchergebnis- und Kein-Treffer-Dialog. | EN: Registers all close events for the search-results and no-match dialogs. */
function addSearchDialogEvents() {
  closeSearchResultsButton.addEventListener("click", closeSearchResultsDialog);
  searchResultsDialog.addEventListener("click", closeSearchResultsOnBackdrop);
  closeSearchErrorButton.addEventListener("click", closeSearchErrorDialog);
  searchErrorOkButton.addEventListener("click", closeSearchErrorDialog);
  searchErrorDialog.addEventListener("click", closeSearchErrorOnBackdrop);
}

/** DE: Blendet den Hinweis aus, sobald mindestens drei Zeichen eingegeben wurden. | EN: Hides the hint as soon as at least three characters have been entered. */
function checkSearchHelp() {
  if (getSearchQuery().length >= 3) hideSearchHelp();
}

/** DE: Startet den Ein-Sekunden-Timer für die Hilfesprechblase. | EN: Starts the one-second timer for the help speech bubble. */
function startSearchHelpTimer() {
  clearTimeout(searchHelpTimer);
  searchHelpTimer = setTimeout(showSearchHelp, 1000);
}

/** DE: Blendet die Hilfesprechblase ein und aktualisiert ihren ARIA-Zustand. | EN: Shows the help speech bubble and updates its ARIA state. */
function showSearchHelp() {
  searchHelpBubble.classList.add("show");
  searchHelpBubble.setAttribute("aria-hidden", "false");
}

/** DE: Beendet den Hilfetimer und blendet die Sprechblase wieder aus. | EN: Stops the help timer and hides the speech bubble again. */
function hideSearchHelp() {
  clearTimeout(searchHelpTimer);
  searchHelpBubble.classList.remove("show");
  searchHelpBubble.setAttribute("aria-hidden", "true");
}

/** DE: Startet die Suche mit Enter und verhindert dabei das normale Standardverhalten der Taste. | EN: Starts the search with Enter and prevents the normal default key behaviour. */
function searchWithEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  startPokemonSearch();
}

/** DE: Prüft die Eingabe, zeigt bei Bedarf den Hinweis und startet sonst die Pokémon-Suche. | EN: Checks the input, shows the hint if needed and otherwise starts the Pokémon search. */
async function startPokemonSearch() {
  const query = getSearchQuery();
  if (!isValidSearchQuery(query)) return showSearchRequirement();
  hideSearchHelp();
  startCustomLoading("Searching Pokémon...");
  await runPokemonSearch(query);
}

/** DE: Prüft, ob die Sucheingabe mindestens drei Zeichen lang ist. | EN: Checks whether the search input contains at least three characters. */
function isValidSearchQuery(query) {
  return query.length >= 3;
}

/** DE: Zeigt die Hilfesprechblase sofort und blendet sie nach einigen Sekunden wieder aus. | EN: Shows the help bubble immediately and hides it again after a few seconds. */
function showSearchRequirement() {
  showSearchHelp();
  clearTimeout(searchHelpTimer);
  searchHelpTimer = setTimeout(hideSearchHelp, 3500);
}

/** DE: Führt die Suche aus und öffnet Treffer oder Fehlerdialog abhängig vom Ergebnis. | EN: Runs the search and opens results or an error dialog depending on the outcome. */
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

/** DE: Rendert die Treffer, sperrt den Hintergrund und öffnet den Suchergebnis-Dialog. | EN: Renders the matches, locks background scrolling and opens the search-results dialog. */
function openSearchResults(results) {
  renderSearchPreview(results);
  stopLoading();
  lockSearchResultPage();
  searchResultsDialog.showModal();
}

/** DE: Erstellt die Vorschaukarten der Suchtreffer und aktualisiert die Trefferanzahl. | EN: Creates preview cards for the search results and updates the result count. */
function renderSearchPreview(results) {
  detailPokemon = results;
  searchResultsList.innerHTML = results.map(getPokemonCardTemplate).join("");
  searchResultsCount.textContent = getSearchResultCountText(results.length);
  addSearchPreviewCardEvents();
}

/** DE: Fügt allen Vorschaukarten im Suchergebnis ein Klick-Ereignis hinzu. | EN: Adds a click event to all preview cards in the search results. */
function addSearchPreviewCardEvents() {
  const cards = searchResultsList.querySelectorAll('[data-id="card"]');
  cards.forEach((card) => card.addEventListener("click", openSearchPreviewCard));
}

/** DE: Erstellt den passenden Text für einen oder mehrere gefundene Suchtreffer. | EN: Creates the matching text for one or multiple search results. */
function getSearchResultCountText(amount) {
  if (amount === 1) return "1 matching Pokémon found";
  return `${amount} matching Pokémon found`;
}

/** DE: Merkt sich die Rückkehr zum Suchergebnis und öffnet die angeklickte Vorschau in der Detailansicht. | EN: Remembers the return to search results and opens the clicked preview in detail view. */
async function openSearchPreviewCard(event) {
  returnToSearchResults = true;
  hideSearchResultsDialog();
  await openSearchPokemonDetail(Number(event.currentTarget.getAttribute("data-pokemon-id")));
}

/** DE: Setzt das ausgewählte Such-Pokémon und startet den Ladevorgang für seine Detailansicht. | EN: Selects the searched Pokémon and starts loading its detail view. */
async function openSearchPokemonDetail(id) {
  currentPokemonIndex = findDetailPokemonIndex(id);
  startCustomLoading("Loading Pokémon details...");
  await prepareSearchDetail();
}

/** DE: Lädt Nachbarn und Evolutionen des Suchtreffers und öffnet danach die Detailansicht. | EN: Loads neighbours and evolutions of the search result and then opens detail view. */
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

/** DE: Beendet den Ladescreen und zeigt den Kein-Treffer-Dialog an. | EN: Stops the loading screen and displays the no-match dialog. */
function finishEmptySearch() {
  stopLoading();
  showSearchNotFoundDialog();
}

/** DE: Entscheidet anhand der Eingabe, ob nach ID oder nach Pokémon-Namen gesucht wird. | EN: Decides whether to search by ID or Pokémon name based on the input. */
async function findPokemonSearchResults(query) {
  if (isNumberSearch(query)) return searchPokemonNumber(query);
  return searchPokemonName(query);
}

/** DE: Prüft, ob die Suchanfrage nur aus Zahlen besteht. | EN: Checks whether the search query contains only numbers. */
function isNumberSearch(query) {
  for (let i = 0; i < query.length; i++) {
    if (!isSearchNumber(query.charAt(i))) return false;
  }
  return query.length > 0;
}

/** DE: Prüft, ob ein einzelnes Zeichen eine Zahl von 0 bis 9 ist. | EN: Checks whether one character is a number from 0 to 9. */
function isSearchNumber(character) {
  const numbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return numbers.findIndex((number) => number === character) !== -1;
}

/** DE: Sucht ein einzelnes Pokémon anhand einer gültigen ID zwischen 1 und 1025. | EN: Searches for one Pokémon using a valid ID from 1 to 1025. */
async function searchPokemonNumber(query) {
  const id = Number(query);
  if (id < 1 || id > MAX_POKEMON) return [];
  return [await loadPokemonById(id)];
}

/** DE: Sucht im Namensindex nach allen Pokémon, deren Name die eingegebene Zeichenfolge enthält. | EN: Searches the name index for all Pokémon whose name contains the entered text. */
async function searchPokemonName(query) {
  const searchIndex = await getPokemonSearchIndex();
  const matches = searchIndex.filter((pokemon) => pokemonNameMatches(pokemon.name, query));
  return await loadSearchMatches(matches);
}

/** DE: Prüft, ob der Suchtext irgendwo im Pokémon-Namen vorkommt. | EN: Checks whether the search text occurs anywhere inside a Pokémon name. */
function pokemonNameMatches(name, query) {
  for (let start = 0; start <= name.length - query.length; start++) {
    if (textMatchesAtPosition(name, query, start)) return true;
  }
  return false;
}

/** DE: Vergleicht den Suchtext Zeichen für Zeichen ab einer bestimmten Position. | EN: Compares the search text character by character from a specific position. */
function textMatchesAtPosition(name, query, start) {
  for (let i = 0; i < query.length; i++) {
    if (name.charAt(start + i) !== query.charAt(i)) return false;
  }
  return true;
}

/** DE: Nimmt den Suchindex aus dem Cache oder lädt einmalig alle Namen und IDs von der PokéAPI. | EN: Uses the cached search index or loads all names and IDs once from PokéAPI. */
async function getPokemonSearchIndex() {
  const savedIndex = getSearchIndex();
  if (savedIndex.length > 0) return savedIndex;
  const data = await fetchJson(`${API_URL}?limit=${MAX_POKEMON}&offset=0`);
  const searchIndex = prepareSearchIndex(data.results);
  saveSearchIndex(searchIndex);
  return searchIndex;
}

/** DE: Bereitet die API-Suchergebnisse auf und entfernt IDs oberhalb von 1025. | EN: Prepares the API search results and removes IDs above 1025. */
function prepareSearchIndex(results) {
  return results.map(getSearchIndexItem)
    .filter((pokemon) => pokemon.id <= MAX_POKEMON);
}

/** DE: Erstellt aus einem API-Sucheintrag ein einfaches Objekt aus ID und Name. | EN: Creates a simple object with ID and name from one API search entry. */
function getSearchIndexItem(pokemon) {
  return {
    id: getSearchIdFromUrl(pokemon.url),
    name: pokemon.name,
  };
}

/** DE: Liest die Pokémon-ID aus der URL eines Suchindex-Eintrags aus. | EN: Reads the Pokémon ID from the URL of a search-index entry. */
function getSearchIdFromUrl(url) {
  return getIdFromApiUrl(url);
}

/** DE: Lädt alle gefundenen Suchtreffer nacheinander und gibt die vollständigen Pokémon-Daten zurück. | EN: Loads all matching search results one after another and returns their full Pokémon data. */
async function loadSearchMatches(matches) {
  const pokemon = [];
  for (const match of matches) {
    pokemon.push(await loadPokemonById(match.id));
  }
  return pokemon;
}

/** DE: Liest den Suchtext aus, entfernt Leerzeichen am Rand und schreibt ihn klein. | EN: Reads the search text, removes surrounding spaces and converts it to lowercase. */
function getSearchQuery() {
  const text = trimSearchText(searchInput.value);
  return convertSearchTextToLowerCase(text);
}

/** DE: Entfernt Leerzeichen am Anfang und Ende des Suchtextes. | EN: Removes spaces from the beginning and end of the search text. */
function trimSearchText(text) {
  let start = 0;
  let end = text.length - 1;
  while (start < text.length && text.charAt(start) === " ") start++;
  while (end >= start && text.charAt(end) === " ") end--;
  return getSearchTextPart(text, start, end);
}

/** DE: Baut den Suchtext zwischen Start- und Endposition neu zusammen. | EN: Builds the search text again between a start and end position. */
function getSearchTextPart(text, start, end) {
  let result = "";
  for (let i = start; i <= end; i++) result += text.charAt(i);
  return result;
}

/** DE: Wandelt Großbuchstaben im Suchtext mit einfachen Arrays in Kleinbuchstaben um. | EN: Converts uppercase letters in the search text to lowercase using simple arrays. */
function convertSearchTextToLowerCase(text) {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    result += getLowerCaseLetter(text.charAt(i));
  }
  return result;
}

/** DE: Gibt für einen Großbuchstaben den passenden Kleinbuchstaben zurück. | EN: Returns the matching lowercase letter for an uppercase letter. */
function getLowerCaseLetter(letter) {
  const upper = getUpperCaseLetters();
  const lower = getLowerCaseLetters();
  const index = upper.findIndex((item) => item === letter);
  if (index === -1) return letter;
  return lower[index];
}

/** DE: Gibt alle Großbuchstaben zurück, die für die Suche benötigt werden. | EN: Returns all uppercase letters needed for the search conversion. */
function getUpperCaseLetters() {
  return ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
    "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];
}

/** DE: Gibt alle Kleinbuchstaben zurück, die zu den Großbuchstaben gehören. | EN: Returns all lowercase letters matching the uppercase letters. */
function getLowerCaseLetters() {
  return ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m",
    "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
}

/** DE: Beendet den Rückkehrmodus und schließt den Suchergebnis-Dialog. | EN: Ends the return mode and closes the search-results dialog. */
function closeSearchResultsDialog() {
  returnToSearchResults = false;
  hideSearchResultsDialog();
}

/** DE: Schließt den Suchergebnis-Dialog und gibt den Hintergrund wieder zum Scrollen frei. | EN: Closes the search-results dialog and allows background scrolling again. */
function hideSearchResultsDialog() {
  searchResultsDialog.close();
  unlockSearchResultPage();
}

/** DE: Öffnet nach dem Schließen einer Detailansicht wieder das vorherige Suchergebnis. | EN: Reopens the previous search results after the detail view is closed. */
function reopenSearchResultsAfterDetail() {
  if (!returnToSearchResults) return;
  lockSearchResultPage();
  searchResultsDialog.showModal();
}

/** DE: Sperrt den Seitenhintergrund, solange das Suchergebnis geöffnet ist. | EN: Locks background scrolling while the search-results dialog is open. */
function lockSearchResultPage() {
  document.body.style.overflow = "hidden";
}

/** DE: Gibt den Seitenhintergrund nach dem Schließen des Suchergebnisses wieder frei. | EN: Allows background scrolling again after the search results are closed. */
function unlockSearchResultPage() {
  document.body.style.overflow = "";
}

/** DE: Schließt das Suchergebnis, wenn direkt auf den Hintergrund neben dem Dialog geklickt wird. | EN: Closes the search results when the dialog backdrop is clicked. */
function closeSearchResultsOnBackdrop(event) {
  if (event.target === searchResultsDialog) closeSearchResultsDialog();
}

/** DE: Fügt die Kein-Treffer-Meldung ein und öffnet den dazugehörigen Dialog. | EN: Inserts the no-match message and opens the related dialog. */
function showSearchNotFoundDialog() {
  searchErrorMessage.innerHTML = getNotFoundTemplate();
  searchErrorDialog.showModal();
}

/** DE: Schließt den Kein-Treffer-Dialog. | EN: Closes the no-match dialog. */
function closeSearchErrorDialog() {
  searchErrorDialog.close();
}

/** DE: Schließt den Kein-Treffer-Dialog bei einem Klick neben den Dialoginhalt. | EN: Closes the no-match dialog when its backdrop is clicked. */
function closeSearchErrorOnBackdrop(event) {
  if (event.target === searchErrorDialog) closeSearchErrorDialog();
}
