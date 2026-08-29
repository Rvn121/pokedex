"use strict";

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

/** DE: Ruft eine URL ab und gibt die erhaltenen Daten als JSON zurück. | EN: Fetches a URL and returns the received data as JSON. */
async function fetchJson(url) {
  const response = await fetch(url);
  return await response.json();
}

/** DE: Lädt ein Pokémon anhand seiner ID oder nimmt es aus der Datenbank, wenn es bereits gespeichert ist. | EN: Loads a Pokémon by ID or returns it from the database if it is already cached. */
async function loadPokemonById(id) {
  const savedPokemon = getPokemonFromDatabase(id);
  if (savedPokemon) return savedPokemon;
  const pokemon = await fetchPokemonById(id);
  savePokemonList([pokemon]);
  return pokemon;
}

/** DE: Lädt ein einzelnes Pokémon über die PokéAPI und bereitet die erhaltenen Daten auf. | EN: Loads one Pokémon from PokéAPI and prepares the received data. */
async function fetchPokemonById(id) {
  const data = await fetchJson(API_URL + id);
  return preparePokemonData(data);
}

/** DE: Erstellt aus den API-Daten ein übersichtliches Pokémon-Objekt für unsere Anwendung. | EN: Creates a clear Pokémon object from the API data for this application. */
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

/** DE: Liest alle Typen eines Pokémon aus den API-Daten aus. | EN: Reads all Pokémon types from the API data. */
function getPokemonTypes(data) {
  return data.types.map((item) => item.type.name);
}

/** DE: Sammelt die benötigten Pokémon-Bilder in einem eigenen Objekt. | EN: Collects the required Pokémon images in one object. */
function getPokemonImages(data) {
  return {
    official: getOfficialImage(data),
    sprite: data.sprites.front_default,
    home: getHomeImage(data),
  };
}

/** DE: Gibt das offizielle Artwork zurück und nutzt ersatzweise das normale Sprite. | EN: Returns the official artwork and uses the normal sprite as a fallback. */
function getOfficialImage(data) {
  const artwork = data.sprites.other["official-artwork"];
  return artwork.front_default || data.sprites.front_default;
}

/** DE: Gibt das HOME-Artwork zurück und nutzt ersatzweise das normale Sprite. | EN: Returns the HOME artwork and uses the normal sprite as a fallback. */
function getHomeImage(data) {
  const home = data.sprites.other.home;
  return home.front_default || data.sprites.front_default;
}

/** DE: Wandelt die Basiswerte des Pokémon in ein einfaches Array um. | EN: Converts the Pokémon base stats into a simple array. */
function getPokemonStats(data) {
  return data.stats.map(getPokemonStat);
}

/** DE: Erstellt aus einem einzelnen Basiswert ein Objekt mit Name und Wert. | EN: Creates an object with name and value from one base stat. */
function getPokemonStat(item) {
  return {
    name: item.stat.name,
    value: item.base_stat,
  };
}

/** DE: Liest die Fähigkeiten eines Pokémon aus den API-Daten aus. | EN: Reads the Pokémon abilities from the API data. */
function getPokemonAbilities(data) {
  return data.abilities.map((item) => item.ability.name);
}

/** DE: Liest die ersten 20 Attacken eines Pokémon aus den API-Daten aus. | EN: Reads the first 20 moves from the Pokémon API data. */
function getPokemonMoves(data) {
  const moves = [];
  for (let i = 0; i < data.moves.length && i < 20; i++) {
    moves.push(data.moves[i].move.name);
  }
  return moves;
}

/** DE: Liest die Pokémon-ID am Ende einer PokéAPI-URL aus. | EN: Reads the Pokémon ID from the end of a PokéAPI URL. */
function getIdFromApiUrl(url) {
  let number = "";
  let index = url.length - 2;
  while (index >= 0 && url.charAt(index) !== "/") {
    number = url.charAt(index) + number;
    index--;
  }
  return Number(number);
}
