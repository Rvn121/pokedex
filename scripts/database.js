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

// Initialisiert die lokale Sitzungsdatenbank und lädt vorhandene Daten oder die leere JSON-Grundstruktur.
async function initDatabase() {
  addDatabaseNavigationEvents();
  const savedDatabase = sessionStorage.getItem(DATABASE_KEY);
  if (savedDatabase) return loadSavedDatabase(savedDatabase);
  await loadEmptyDatabase();
}

// Registriert Ereignisse, damit die Daten beim Seitenwechsel erhalten bleiben und nur beim echten Refresh gelöscht werden.
function addDatabaseNavigationEvents() {
  const links = document.querySelectorAll("a");
  links.forEach((link) => link.addEventListener("click", keepDatabase));
  window.addEventListener("beforeunload", clearDatabaseOnRefresh);
}

// Merkt sich, dass die Seite über einen Link verlassen wird und die gespeicherten Daten erhalten bleiben sollen.
function keepDatabase() {
  leavePageByLink = true;
}

// Löscht die Session-Datenbank, wenn die Seite wirklich neu geladen wird.
function clearDatabaseOnRefresh() {
  if (!leavePageByLink) sessionStorage.removeItem(DATABASE_KEY);
}

// Liest die bereits gespeicherte JSON-Datenbank aus dem sessionStorage ein.
function loadSavedDatabase(savedDatabase) {
  pokemonDatabase = JSON.parse(savedDatabase);
  ensureDatabaseFields();
}

// Lädt die leere database.json und speichert diese als neue Sitzungsdatenbank.
async function loadEmptyDatabase() {
  const response = await fetch(DATABASE_FILE);
  pokemonDatabase = await response.json();
  ensureDatabaseFields();
  saveDatabase();
}

// Stellt sicher, dass alle benötigten Bereiche in der Datenbank vorhanden sind.
function ensureDatabaseFields() {
  if (!pokemonDatabase.pokemon) pokemonDatabase.pokemon = [];
  if (!pokemonDatabase.evolutions) pokemonDatabase.evolutions = {};
  if (!pokemonDatabase.contentIds) pokemonDatabase.contentIds = [];
  if (!pokemonDatabase.searchIndex) pokemonDatabase.searchIndex = [];
}

// Wandelt die Datenbank in JSON um und speichert sie im sessionStorage.
function saveDatabase() {
  const databaseAsJson = JSON.stringify(pokemonDatabase);
  sessionStorage.setItem(DATABASE_KEY, databaseAsJson);
}

// Speichert mehrere Pokémon, sortiert sie nach ID und aktualisiert anschließend die Datenbank.
function savePokemonList(pokemonList) {
  pokemonList.forEach(savePokemon);
  pokemonDatabase.pokemon.sort(sortPokemonById);
  saveDatabase();
}

// Speichert ein Pokémon nur dann, wenn es noch nicht in der Datenbank vorhanden ist.
function savePokemon(pokemon) {
  const index = findPokemonInDatabase(pokemon.id);
  if (index === -1) pokemonDatabase.pokemon.push(pokemon);
}

// Sucht die Position eines Pokémon anhand seiner ID in der gespeicherten Pokémon-Liste.
function findPokemonInDatabase(id) {
  return pokemonDatabase.pokemon.findIndex((pokemon) => pokemon.id === id);
}

// Gibt ein gespeichertes Pokémon anhand seiner ID zurück oder null, wenn es nicht vorhanden ist.
function getPokemonFromDatabase(id) {
  const index = findPokemonInDatabase(id);
  if (index === -1) return null;
  return pokemonDatabase.pokemon[index];
}

// Speichert die IDs der Pokémon, die im normalen Kartenbereich angezeigt werden sollen.
function saveContentIds(ids) {
  ids.forEach(saveContentId);
  pokemonDatabase.contentIds.sort((firstId, secondId) => firstId - secondId);
  saveDatabase();
}

// Fügt eine einzelne Content-ID nur hinzu, wenn sie noch nicht gespeichert wurde.
function saveContentId(id) {
  const index = findContentId(id);
  if (index === -1) pokemonDatabase.contentIds.push(id);
}

// Sucht eine Content-ID in der gespeicherten ID-Liste.
function findContentId(id) {
  return pokemonDatabase.contentIds.findIndex((savedId) => savedId === id);
}

// Gibt alle IDs zurück, die zum normalen Kartenbereich gehören.
function getContentIds() {
  return pokemonDatabase.contentIds;
}

// Erstellt aus den gespeicherten Content-IDs die Pokémon-Liste für den normalen Kartenbereich.
function getContentPokemonFromDatabase() {
  const pokemon = [];
  pokemonDatabase.contentIds.forEach((id) => addContentPokemon(pokemon, id));
  return pokemon;
}

// Fügt ein gespeichertes Pokémon zur übergebenen Content-Liste hinzu.
function addContentPokemon(pokemon, id) {
  const savedPokemon = getPokemonFromDatabase(id);
  if (savedPokemon) pokemon.push(savedPokemon);
}

// Speichert den Namens- und ID-Index, der für die Suche verwendet wird.
function saveSearchIndex(searchIndex) {
  pokemonDatabase.searchIndex = searchIndex;
  saveDatabase();
}

// Gibt den bereits gespeicherten Suchindex zurück.
function getSearchIndex() {
  return pokemonDatabase.searchIndex;
}

// Vergleicht zwei Pokémon anhand ihrer ID und wird zum Sortieren verwendet.
function sortPokemonById(firstPokemon, secondPokemon) {
  return firstPokemon.id - secondPokemon.id;
}

// Speichert eine komplette Evolutionskette für alle darin enthaltenen Pokémon.
function saveEvolutionChain(evolution) {
  evolution.forEach((item) => saveEvolutionForId(item.id, evolution));
  saveDatabase();
}

// Ordnet einer Pokémon-ID die passende Evolutionskette in der Datenbank zu.
function saveEvolutionForId(id, evolution) {
  pokemonDatabase.evolutions[id] = evolution;
}

// Gibt eine bereits gespeicherte Evolutionskette anhand der Pokémon-ID zurück.
function getEvolutionFromDatabase(id) {
  return pokemonDatabase.evolutions[id];
}
