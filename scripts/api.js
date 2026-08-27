"use strict";

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

// Ruft eine URL ab und gibt die erhaltenen Daten als JSON zurück.
async function fetchJson(url) {
  const response = await fetch(url);
  return await response.json();
}

// Lädt ein Pokémon anhand seiner ID oder nimmt es aus der Datenbank, wenn es bereits gespeichert ist.
async function loadPokemonById(id) {
  const savedPokemon = getPokemonFromDatabase(id);
  if (savedPokemon) return savedPokemon;
  const pokemon = await fetchPokemonById(id);
  savePokemonList([pokemon]);
  return pokemon;
}

// Lädt ein einzelnes Pokémon über die PokéAPI und bereitet die erhaltenen Daten auf.
async function fetchPokemonById(id) {
  const data = await fetchJson(API_URL + id);
  return preparePokemonData(data);
}

// Erstellt aus den API-Daten ein übersichtliches Pokémon-Objekt für unsere Anwendung.
function preparePokemonData(data) {
  return {
    id: data.id,
    name: data.name,
    types: getPokemonTypes(data),
    images: getPokemonImages(data),
    stats: getPokemonStats(data),
    abilities: getPokemonAbilities(data),
    height: data.height,
    weight: data.weight,
    moves: getPokemonMoves(data),
  };
}

// Liest alle Typen eines Pokémon aus den API-Daten aus.
function getPokemonTypes(data) {
  return data.types.map((item) => item.type.name);
}

// Sammelt die benötigten Pokémon-Bilder in einem eigenen Objekt.
function getPokemonImages(data) {
  return {
    official: getOfficialImage(data),
    sprite: data.sprites.front_default,
    home: getHomeImage(data),
  };
}

// Gibt das offizielle Artwork zurück und nutzt ersatzweise das normale Sprite.
function getOfficialImage(data) {
  const artwork = data.sprites.other["official-artwork"];
  return artwork.front_default || data.sprites.front_default;
}

// Gibt das HOME-Artwork zurück und nutzt ersatzweise das normale Sprite.
function getHomeImage(data) {
  const home = data.sprites.other.home;
  return home.front_default || data.sprites.front_default;
}

// Wandelt die Basiswerte des Pokémon in ein einfaches Array um.
function getPokemonStats(data) {
  return data.stats.map(getPokemonStat);
}

// Erstellt aus einem einzelnen Basiswert ein Objekt mit Name und Wert.
function getPokemonStat(item) {
  return {
    name: item.stat.name,
    value: item.base_stat,
  };
}

// Liest die Fähigkeiten eines Pokémon aus den API-Daten aus.
function getPokemonAbilities(data) {
  return data.abilities.map((item) => item.ability.name);
}

// Liest die ersten 20 Attacken eines Pokémon aus den API-Daten aus.
function getPokemonMoves(data) {
  const moves = [];
  for (let i = 0; i < data.moves.length && i < 20; i++) {
    moves.push(data.moves[i].move.name);
  }
  return moves;
}

// Liest die Pokémon-ID am Ende einer PokéAPI-URL aus.
function getIdFromApiUrl(url) {
  let number = "";
  let index = url.length - 2;
  while (index >= 0 && url.charAt(index) !== "/") {
    number = url.charAt(index) + number;
    index--;
  }
  return Number(number);
}
