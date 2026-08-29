"use strict";

const DATABASE_KEY = "pokedexDatabase";
const DATABASE_FILE = "./scripts/database.json";

let pokemonDatabase = {
  pokemon: [],
  evolutions: {},
  contentIds: [],
  searchIndex: [],
};

let leavePageByLink = false;

/** DE: Initialisiert die lokale Sitzungsdatenbank und lädt vorhandene Daten oder die leere JSON-Grundstruktur. | EN: Initializes the local session database and loads saved data or the empty JSON structure. */
async function initDatabase() {
  addDatabaseNavigationEvents();
  const savedDatabase = sessionStorage.getItem(DATABASE_KEY);
  if (savedDatabase) return loadSavedDatabase(savedDatabase);
  await loadEmptyDatabase();
}

/** DE: Registriert Ereignisse, damit die Daten beim Seitenwechsel erhalten bleiben und nur beim echten Refresh gelöscht werden. | EN: Registers events so data survives page changes and is cleared only on a real refresh. */
function addDatabaseNavigationEvents() {
  const links = document.querySelectorAll("a");
  links.forEach((link) => link.addEventListener("click", keepDatabase));
  window.addEventListener("beforeunload", clearDatabaseOnRefresh);
}

/** DE: Merkt sich, dass die Seite über einen Link verlassen wird und die gespeicherten Daten erhalten bleiben sollen. | EN: Remembers that the page is being left through a link so stored data should be kept. */
function keepDatabase() {
  leavePageByLink = true;
}

/** DE: Löscht die Session-Datenbank, wenn die Seite wirklich neu geladen wird. | EN: Clears the session database when the page is actually refreshed. */
function clearDatabaseOnRefresh() {
  if (!leavePageByLink) sessionStorage.removeItem(DATABASE_KEY);
}

/** DE: Liest die bereits gespeicherte JSON-Datenbank aus dem sessionStorage ein. | EN: Reads the stored JSON database from sessionStorage. */
function loadSavedDatabase(savedDatabase) {
  pokemonDatabase = JSON.parse(savedDatabase);
  ensureDatabaseFields();
}

/** DE: Lädt die leere database.json und speichert diese als neue Sitzungsdatenbank. | EN: Loads the empty database.json and saves it as the new session database. */
async function loadEmptyDatabase() {
  const response = await fetch(DATABASE_FILE);
  pokemonDatabase = await response.json();
  ensureDatabaseFields();
  saveDatabase();
}

/** DE: Stellt sicher, dass alle benötigten Bereiche in der Datenbank vorhanden sind. | EN: Ensures that all required database sections exist. */
function ensureDatabaseFields() {
  if (!pokemonDatabase.pokemon) pokemonDatabase.pokemon = [];
  if (!pokemonDatabase.evolutions) pokemonDatabase.evolutions = {};
  if (!pokemonDatabase.contentIds) pokemonDatabase.contentIds = [];
  if (!pokemonDatabase.searchIndex) pokemonDatabase.searchIndex = [];
}

/** DE: Wandelt die Datenbank in JSON um und speichert sie im sessionStorage. | EN: Converts the database to JSON and stores it in sessionStorage. */
function saveDatabase() {
  const databaseAsJson = JSON.stringify(pokemonDatabase);
  sessionStorage.setItem(DATABASE_KEY, databaseAsJson);
}

/** DE: Speichert mehrere Pokémon, sortiert sie nach ID und aktualisiert anschließend die Datenbank. | EN: Saves multiple Pokémon, sorts them by ID and updates the database. */
function savePokemonList(pokemonList) {
  pokemonList.forEach(savePokemon);
  pokemonDatabase.pokemon.sort(sortPokemonById);
  saveDatabase();
}

/** DE: Speichert ein Pokémon nur dann, wenn es noch nicht in der Datenbank vorhanden ist. | EN: Saves a Pokémon only if it is not already stored in the database. */
function savePokemon(pokemon) {
  const index = findPokemonInDatabase(pokemon.id);
  if (index === -1) pokemonDatabase.pokemon.push(pokemon);
}

/** DE: Sucht die Position eines Pokémon anhand seiner ID in der gespeicherten Pokémon-Liste. | EN: Finds the position of a Pokémon by ID in the stored Pokémon list. */
function findPokemonInDatabase(id) {
  return pokemonDatabase.pokemon.findIndex((pokemon) => pokemon.id === id);
}

/** DE: Gibt ein gespeichertes Pokémon anhand seiner ID zurück oder null, wenn es nicht vorhanden ist. | EN: Returns a stored Pokémon by ID or null if it does not exist. */
function getPokemonFromDatabase(id) {
  const index = findPokemonInDatabase(id);
  if (index === -1) return null;
  return pokemonDatabase.pokemon[index];
}

/** DE: Speichert die IDs der Pokémon, die im normalen Kartenbereich angezeigt werden sollen. | EN: Stores the IDs of Pokémon that should be displayed in the normal card area. */
function saveContentIds(ids) {
  ids.forEach(saveContentId);
  pokemonDatabase.contentIds.sort((firstId, secondId) => firstId - secondId);
  saveDatabase();
}

/** DE: Fügt eine einzelne Content-ID nur hinzu, wenn sie noch nicht gespeichert wurde. | EN: Adds one content ID only if it has not been stored yet. */
function saveContentId(id) {
  const index = findContentId(id);
  if (index === -1) pokemonDatabase.contentIds.push(id);
}

/** DE: Sucht eine Content-ID in der gespeicherten ID-Liste. | EN: Finds a content ID in the stored ID list. */
function findContentId(id) {
  return pokemonDatabase.contentIds.findIndex((savedId) => savedId === id);
}

/** DE: Gibt alle IDs zurück, die zum normalen Kartenbereich gehören. | EN: Returns all IDs that belong to the normal card area. */
function getContentIds() {
  return pokemonDatabase.contentIds;
}

/** DE: Erstellt aus den gespeicherten Content-IDs die Pokémon-Liste für den normalen Kartenbereich. | EN: Creates the Pokémon list for the normal card area from the stored content IDs. */
function getContentPokemonFromDatabase() {
  const pokemon = [];
  pokemonDatabase.contentIds.forEach((id) => addContentPokemon(pokemon, id));
  return pokemon;
}

/** DE: Fügt ein gespeichertes Pokémon zur übergebenen Content-Liste hinzu. | EN: Adds a stored Pokémon to the provided content list. */
function addContentPokemon(pokemon, id) {
  const savedPokemon = getPokemonFromDatabase(id);
  if (savedPokemon) pokemon.push(savedPokemon);
}

/** DE: Speichert den Namens- und ID-Index, der für die Suche verwendet wird. | EN: Stores the name and ID index used for searching. */
function saveSearchIndex(searchIndex) {
  pokemonDatabase.searchIndex = searchIndex;
  saveDatabase();
}

/** DE: Gibt den bereits gespeicherten Suchindex zurück. | EN: Returns the already stored search index. */
function getSearchIndex() {
  return pokemonDatabase.searchIndex;
}

/** DE: Vergleicht zwei Pokémon anhand ihrer ID und wird zum Sortieren verwendet. | EN: Compares two Pokémon by ID and is used for sorting. */
function sortPokemonById(firstPokemon, secondPokemon) {
  return firstPokemon.id - secondPokemon.id;
}

/** DE: Speichert eine komplette Evolutionskette für alle darin enthaltenen Pokémon. | EN: Stores a complete evolution chain for all Pokémon contained in it. */
function saveEvolutionChain(evolution) {
  evolution.forEach((item) => saveEvolutionForId(item.id, evolution));
  saveDatabase();
}

/** DE: Ordnet einer Pokémon-ID die passende Evolutionskette in der Datenbank zu. | EN: Assigns the matching evolution chain to one Pokémon ID in the database. */
function saveEvolutionForId(id, evolution) {
  pokemonDatabase.evolutions[id] = evolution;
}

/** DE: Gibt eine bereits gespeicherte Evolutionskette anhand der Pokémon-ID zurück. | EN: Returns an already stored evolution chain by Pokémon ID. */
function getEvolutionFromDatabase(id) {
  return pokemonDatabase.evolutions[id];
}
