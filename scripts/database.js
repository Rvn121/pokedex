"use strict";

const DATABASE_KEY = "pokedexDatabase";
const DATABASE_FILE = "./scripts/database.json";

let pokemonDatabase = {
  pokemon: [],
  evolutions: {},
  contentIds: [],
  searchIndex: [],
};

async function initDatabase() {
  clearDatabaseOnRefresh();
  const savedDatabase = sessionStorage.getItem(DATABASE_KEY);
  if (savedDatabase) return loadSavedDatabase(savedDatabase);
  await loadEmptyDatabase();
}

function clearDatabaseOnRefresh() {
  const navigation = performance.getEntriesByType("navigation")[0];
  if (!navigation) return;
  if (navigation.type === "reload") {
    sessionStorage.removeItem(DATABASE_KEY);
  }
}

function loadSavedDatabase(savedDatabase) {
  pokemonDatabase = JSON.parse(savedDatabase);
  ensureDatabaseFields();
}

async function loadEmptyDatabase() {
  const response = await fetch(DATABASE_FILE);
  if (!response.ok) throw new Error("Database could not be loaded.");
  pokemonDatabase = await response.json();
  ensureDatabaseFields();
  saveDatabase();
}

function ensureDatabaseFields() {
  if (!pokemonDatabase.pokemon) pokemonDatabase.pokemon = [];
  if (!pokemonDatabase.evolutions) pokemonDatabase.evolutions = {};
  if (!pokemonDatabase.contentIds) pokemonDatabase.contentIds = [];
  if (!pokemonDatabase.searchIndex) pokemonDatabase.searchIndex = [];
}

function saveDatabase() {
  const databaseAsJson = JSON.stringify(pokemonDatabase);
  sessionStorage.setItem(DATABASE_KEY, databaseAsJson);
}

function savePokemonList(pokemonList) {
  pokemonList.forEach(savePokemon);
  pokemonDatabase.pokemon.sort(sortPokemonById);
  saveDatabase();
}

function savePokemon(pokemon) {
  const savedPokemon = getPokemonFromDatabase(pokemon.id);
  if (!savedPokemon) pokemonDatabase.pokemon.push(pokemon);
}

function getPokemonFromDatabase(id) {
  return pokemonDatabase.pokemon.find((pokemon) => pokemon.id === id);
}

function getAllPokemonFromDatabase() {
  return pokemonDatabase.pokemon;
}

function saveContentIds(ids) {
  ids.forEach(saveContentId);
  pokemonDatabase.contentIds.sort((firstId, secondId) => firstId - secondId);
  saveDatabase();
}

function saveContentId(id) {
  if (!pokemonDatabase.contentIds.includes(id)) {
    pokemonDatabase.contentIds.push(id);
  }
}

function getContentIds() {
  return pokemonDatabase.contentIds;
}

function getContentPokemonFromDatabase() {
  return pokemonDatabase.contentIds
    .map((id) => getPokemonFromDatabase(id))
    .filter((pokemon) => pokemon);
}

function saveSearchIndex(searchIndex) {
  pokemonDatabase.searchIndex = searchIndex;
  saveDatabase();
}

function getSearchIndex() {
  return pokemonDatabase.searchIndex;
}

function sortPokemonById(firstPokemon, secondPokemon) {
  return firstPokemon.id - secondPokemon.id;
}

function saveEvolutionChain(evolution) {
  evolution.forEach((item) => saveEvolutionForId(item.id, evolution));
  saveDatabase();
}

function saveEvolutionForId(id, evolution) {
  pokemonDatabase.evolutions[id] = evolution;
}

function getEvolutionFromDatabase(id) {
  return pokemonDatabase.evolutions[id];
}
