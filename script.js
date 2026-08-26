"use strict";

const MAX_POKEMON = 1025;
const START_AMOUNT = 20;

const pokemonList = document.getElementById("pokemonList");
const pokemonDialog = document.getElementById("pokemonDialog");
const errorDialog = document.getElementById("errorDialog");
const detailCard = document.getElementById("detailCard");
const catchBall = document.getElementById("catchBall");
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const loadedCounter = document.getElementById("loadedCounter");
const loadMoreButton = document.getElementById("loadMoreButton");
const loadCountSelect = document.getElementById("loadCountSelect");
const loadButtonStage = document.getElementById("loadButtonStage");
const closeDialogButton = document.getElementById("closeDialogButton");
const closeErrorButton = document.getElementById("closeErrorButton");
const prevPokemonButton = document.getElementById("prevPokemonButton");
const nextPokemonButton = document.getElementById("nextPokemonButton");
const pokemonInfoCarousel = document.getElementById("pokemonInfoCarousel");

let renderedPokemon = [];
let detailPokemon = [];
let currentPokemonIndex = 0;
let isLoading = false;

// Startet die Anwendung und initialisiert alle wichtigen Bereiche des Pokédex.
async function init() {
  initDetail();
  initEvolution();
  initLoadMore();
  initLoadButton();
  initSearch();
  await preparePokemonPage();
}

window.addEventListener("load", init);
