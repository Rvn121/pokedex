"use strict";

const cards = [...document.querySelectorAll('[data-id="card"]')];
const pokemonDialog = document.getElementById("pokemonDialog");
const errorDialog = document.getElementById("errorDialog");
const detailCard = document.getElementById("detailCard");
const catchBall = document.getElementById("catchBall");
const loadingScreen = document.getElementById("loadingScreen");
const loadingText = document.getElementById("loadingText");
const loadMoreButton = document.getElementById("loadMoreButton");
const loadCountSelect = document.getElementById("loadCountSelect");
const closeDialogButton = document.getElementById("closeDialogButton");
const closeErrorButton = document.getElementById("closeErrorButton");
const prevPokemonButton = document.getElementById("prevPokemonButton");
const nextPokemonButton = document.getElementById("nextPokemonButton");
const previousEvolutionButton = document.getElementById("previousEvolutionButton");
const nextEvolutionButton = document.getElementById("nextEvolutionButton");

const typeClasses = [
  "type-normal", "type-fire", "type-water", "type-grass", "type-electric",
  "type-ice", "type-fighting", "type-poison", "type-ground", "type-flying",
  "type-psychic", "type-bug", "type-rock", "type-ghost", "type-dragon",
  "type-dark", "type-steel", "type-fairy",
];

const evolutionChains = [
  [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12],
  [13, 14, 15], [16, 17, 18], [19, 20],
];

let currentPokemonIndex = 0;

function init() {
  addCardEvents();
  addDialogEvents();
  addNavigationEvents();
  addLoadEvent();
  addEvolutionEvents();
}

function addCardEvents() {
  cards.forEach((card, index) => {
    card.addEventListener("click", () => catchPokemon(card, index));
  });
}

function addDialogEvents() {
  closeDialogButton.addEventListener("click", closePokemonDialog);
  closeErrorButton.addEventListener("click", closeErrorDialog);
  pokemonDialog.addEventListener("click", closeDialogOnBackdrop);
  pokemonDialog.addEventListener("close", unlockPage);
}

function addNavigationEvents() {
  prevPokemonButton.addEventListener("click", showPreviousPokemon);
  nextPokemonButton.addEventListener("click", showNextPokemon);
}

function addLoadEvent() {
  loadMoreButton.addEventListener("click", showLoadingPreview);
}

function addEvolutionEvents() {
  previousEvolutionButton.addEventListener("click", showPreviousEvolution);
  nextEvolutionButton.addEventListener("click", showNextEvolution);
}

function catchPokemon(card, index) {
  currentPokemonIndex = index;
  placeCatchBall(card);
  card.classList.add("is-caught");
  setTimeout(moveCatchBallToCenter, 100);
  setTimeout(() => finishCatch(card), 900);
}

function placeCatchBall(card) {
  const rect = card.getBoundingClientRect();
  catchBall.style.left = `${rect.left + rect.width / 2}px`;
  catchBall.style.top = `${rect.top + rect.height / 2}px`;
  catchBall.classList.remove("roll");
  catchBall.classList.add("show");
}

function moveCatchBallToCenter() {
  catchBall.style.left = "50%";
  catchBall.style.top = "50%";
  catchBall.classList.add("roll");
}

function finishCatch(card) {
  card.classList.remove("is-caught");
  catchBall.classList.remove("show", "roll");
  openPokemonDialog(currentPokemonIndex);
}

function openPokemonDialog(index) {
  updatePokemonDetail(index);
  pokemonDialog.showModal();
  document.body.classList.add("dialog-open");
  restartDetailAnimation();
}

function closePokemonDialog() {
  pokemonDialog.close();
}

function closeDialogOnBackdrop(event) {
  if (event.target === pokemonDialog) {
    closePokemonDialog();
  }
}

function unlockPage() {
  document.body.classList.remove("dialog-open");
}

function restartDetailAnimation() {
  detailCard.classList.remove("pop-out");
  void detailCard.offsetWidth;
  detailCard.classList.add("pop-out");
}

function updatePokemonDetail(index) {
  currentPokemonIndex = index;
  const data = getCardData(index);
  updateDetailHeader(data);
  updateDetailImages(data);
  updateDetailTypes(data);
  updateDetailColor(data.types[0]);
  updateEvolutionButtons(data.id);
}

function getCardData(index) {
  const card = cards[index];
  return {
    id: Number(card.dataset.pokemonId),
    name: card.dataset.pokemonName,
    types: card.dataset.pokemonTypes.split(","),
  };
}

function updateDetailHeader(data) {
  document.getElementById("detailPokemonId").textContent = formatId(data.id);
  document.getElementById("detailPokemonName").textContent = data.name;
}

function updateDetailImages(data) {
  setImage("detailOfficialImage", getOfficialImage(data.id), data.name);
  setImage("detailSpriteImage", getSpriteImage(data.id), data.name);
  setImage("detailHomeImage", getHomeImage(data.id), data.name);
}

function setImage(id, src, name) {
  const image = document.getElementById(id);
  image.src = src;
  image.alt = name;
}

function updateDetailTypes(data) {
  const typeText = data.types.map(capitalizeWord).join(", ");
  document.getElementById("detailTypes").textContent = typeText;
}

function updateDetailColor(type) {
  detailCard.classList.remove(...typeClasses);
  detailCard.classList.add(`type-${type}`);
}

function showPreviousPokemon() {
  currentPokemonIndex = getPreviousIndex();
  updatePokemonDetail(currentPokemonIndex);
  restartDetailAnimation();
}

function showNextPokemon() {
  currentPokemonIndex = getNextIndex();
  updatePokemonDetail(currentPokemonIndex);
  restartDetailAnimation();
}

function getPreviousIndex() {
  return currentPokemonIndex === 0
    ? cards.length - 1
    : currentPokemonIndex - 1;
}

function getNextIndex() {
  return currentPokemonIndex === cards.length - 1
    ? 0
    : currentPokemonIndex + 1;
}

function updateEvolutionButtons(id) {
  const chain = getEvolutionChain(id);
  const position = chain.indexOf(id);
  setEvolutionButton(previousEvolutionButton, chain[position - 1]);
  setEvolutionButton(nextEvolutionButton, chain[position + 1]);
}

function getEvolutionChain(id) {
  return evolutionChains.find((chain) => chain.includes(id)) || [id];
}

function setEvolutionButton(button, id) {
  button.dataset.evolutionId = id || "";
  button.disabled = !id;
}

function showPreviousEvolution() {
  showEvolution(previousEvolutionButton.dataset.evolutionId);
}

function showNextEvolution() {
  showEvolution(nextEvolutionButton.dataset.evolutionId);
}

function showEvolution(id) {
  const index = findCardIndex(Number(id));
  if (index < 0) return;
  updatePokemonDetail(index);
  restartDetailAnimation();
}

function findCardIndex(id) {
  return cards.findIndex((card) => Number(card.dataset.pokemonId) === id);
}

function showLoadingPreview() {
  updateLoadingText();
  loadingScreen.classList.add("show");
  loadingScreen.setAttribute("aria-hidden", "false");
  setTimeout(hideLoadingScreen, 4200);
}

function updateLoadingText() {
  const amount = loadCountSelect.value;
  loadingText.textContent = amount === "all"
    ? "Loading all remaining Pokémon..."
    : `Loading ${amount} Pokémon...`;
}

function hideLoadingScreen() {
  loadingScreen.classList.remove("show");
  loadingScreen.setAttribute("aria-hidden", "true");
}

function showErrorDialog() {
  errorDialog.showModal();
}

function closeErrorDialog() {
  errorDialog.close();
}

function formatId(id) {
  return `#${String(id).padStart(3, "0")}`;
}

function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function getOfficialImage(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

function getSpriteImage(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
}

function getHomeImage(id) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${id}.png`;
}

init();
