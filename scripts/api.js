"use strict";

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("API data could not be loaded.");
  return await response.json();
}

async function loadPokemonById(id) {
  const savedPokemon = getPokemonFromDatabase(id);
  if (savedPokemon) return savedPokemon;
  const pokemon = await fetchPokemonById(id);
  savePokemonList([pokemon]);
  return pokemon;
}

async function fetchPokemonById(id) {
  const data = await fetchJson(API_URL + id);
  return preparePokemonData(data);
}

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

function getPokemonTypes(data) {
  return data.types.map((item) => item.type.name);
}

function getPokemonImages(data) {
  return {
    official: getOfficialImage(data),
    sprite: data.sprites.front_default,
    home: getHomeImage(data),
  };
}

function getOfficialImage(data) {
  const artwork = data.sprites.other["official-artwork"];
  return artwork.front_default || data.sprites.front_default;
}

function getHomeImage(data) {
  const home = data.sprites.other.home;
  return home.front_default || data.sprites.front_default;
}

function getPokemonStats(data) {
  return data.stats.map(getPokemonStat);
}

function getPokemonStat(item) {
  return {
    name: item.stat.name,
    value: item.base_stat,
  };
}

function getPokemonAbilities(data) {
  return data.abilities.map((item) => item.ability.name);
}

function getPokemonMoves(data) {
  return data.moves.slice(0, 20).map((item) => item.move.name);
}
