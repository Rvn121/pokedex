"use strict";

const DATABASE_KEY = "pokedexDatabase";
const DATABASE_FILE = "./scripts/database.json";

let pokemonDatabase = {
  pokemon: [],
  evolutions: {},
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
  if (!pokemonDatabase.evolutions) pokemonDatabase.evolutions = {};
}

async function loadEmptyDatabase() {
  const response = await fetch(DATABASE_FILE);
  if (!response.ok) throw new Error("Database could not be loaded.");
  pokemonDatabase = await response.json();
  if (!pokemonDatabase.evolutions) pokemonDatabase.evolutions = {};
  saveDatabase();
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
