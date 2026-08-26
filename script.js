"use strict";

const API_URL = "https://pokeapi.co/api/v2/pokemon/";
const SPECIES_URL = "https://pokeapi.co/api/v2/pokemon-species/";
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
const loadBackgroundEyes = [...document.querySelectorAll(".load-background-eye")];
const closeDialogButton = document.getElementById("closeDialogButton");
const closeErrorButton = document.getElementById("closeErrorButton");
const prevPokemonButton = document.getElementById("prevPokemonButton");
const nextPokemonButton = document.getElementById("nextPokemonButton");
const previousEvolutionButton = document.getElementById("previousEvolutionButton");
const nextEvolutionButton = document.getElementById("nextEvolutionButton");
const evolutionChainList = document.getElementById("evolutionChainList");
const evolutionStatus = document.getElementById("evolutionStatus");
const pokemonInfoCarousel = document.getElementById("pokemonInfoCarousel");
const detailSectionTabs = [...document.querySelectorAll(".detail-section-tab")];

const typeClasses = [
  "type-normal", "type-fire", "type-water", "type-grass", "type-electric",
  "type-ice", "type-fighting", "type-poison", "type-ground", "type-flying",
  "type-psychic", "type-bug", "type-rock", "type-ghost", "type-dragon",
  "type-dark", "type-steel", "type-fairy",
];

let renderedPokemon = [];
let detailPokemon = [];
let currentPokemonIndex = 0;
let loadButtonTimer;
let isLoading = false;

async function init() {
  addDialogEvents();
  addNavigationEvents();
  addEvolutionEvents();
  addDetailCarouselEvent();
  addLoadEvent();
  addLoadButtonPeekEvents();
  addSearchEvents();
  await preparePokemonPage();
}

async function preparePokemonPage() {
  try {
    await initDatabase();
    if (getContentIds().length > 0) return renderDatabase();
    await loadPokemonAmount(START_AMOUNT);
  } catch (error) {
    showErrorDialog();
  }
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

function addEvolutionEvents() {
  previousEvolutionButton.addEventListener("click", openEvolutionFromButton);
  nextEvolutionButton.addEventListener("click", openEvolutionFromButton);
  evolutionChainList.addEventListener("click", openEvolutionFromList);
}

function openEvolutionFromList(event) {
  const button = event.target.closest("[data-evolution-id]");
  if (!button) return;
  openEvolutionPokemon(Number(button.dataset.evolutionId));
}

function openEvolutionFromButton(event) {
  const id = Number(event.currentTarget.dataset.evolutionId);
  if (id) openEvolutionPokemon(id);
}

function addDetailCarouselEvent() {
  pokemonInfoCarousel.addEventListener("slid.bs.carousel", updateDetailTab);
}

function updateDetailTab(event) {
  detailSectionTabs.forEach((tab) => tab.classList.remove("active"));
  detailSectionTabs[event.to].classList.add("active");
}

function resetDetailCarousel() {
  const carousel = bootstrap.Carousel.getOrCreateInstance(pokemonInfoCarousel);
  carousel.to(0);
}

function addLoadEvent() {
  loadMoreButton.addEventListener("click", loadSelectedPokemonAmount);
}

async function loadSelectedPokemonAmount() {
  const amount = loadCountSelect.value;
  await loadPokemonAmount(amount);
}

async function loadPokemonAmount(amount) {
  if (isLoading) return;
  const ids = getMissingPokemonIds(amount);
  if (ids.length === 0) return updateLoadControls();
  await runPokemonLoading(ids);
}

async function runPokemonLoading(ids) {
  startLoading(ids.length);
  try {
    const pokemon = await fetchPokemonIds(ids);
    savePokemonList(pokemon);
    saveContentIds(ids);
    renderDatabase();
  } catch (error) {
    showErrorDialog();
  } finally {
    stopLoading();
  }
}

async function fetchPokemonIds(ids) {
  const pokemonList = [];
  for (const id of ids) {
    pokemonList.push(await loadPokemonById(id));
  }
  return pokemonList;
}

async function loadPokemonById(id) {
  const storedPokemon = getPokemonFromDatabase(id);
  if (storedPokemon) return storedPokemon;
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
  return data.stats.map((item) => {
    return { name: item.stat.name, value: item.base_stat };
  });
}

function getPokemonAbilities(data) {
  return data.abilities.map((item) => item.ability.name);
}

function getPokemonMoves(data) {
  return data.moves.slice(0, 20).map((item) => item.move.name);
}

function getMissingPokemonIds(amount) {
  const ids = [];
  const contentIds = getContentIds();
  for (let id = 1; id <= MAX_POKEMON; id++) {
    if (!contentIds.includes(id)) ids.push(id);
    if (hasEnoughIds(ids, amount)) break;
  }
  return ids;
}

function hasEnoughIds(ids, amount) {
  if (amount === "all") return false;
  return ids.length >= Number(amount);
}

function renderDatabase() {
  renderedPokemon = getContentPokemonFromDatabase();
  pokemonList.innerHTML = renderedPokemon.map(getPokemonCardTemplate).join("");
  addCardEvents();
  updateLoadedCounter();
  updateLoadControls();
}

function addCardEvents() {
  const cards = [...pokemonList.querySelectorAll('[data-id="card"]')];
  cards.forEach((card) => card.addEventListener("click", openClickedCard));
}

function openClickedCard(event) {
  const card = event.currentTarget;
  const id = Number(card.dataset.pokemonId);
  returnToSearchResults = false;
  detailPokemon = renderedPokemon;
  currentPokemonIndex = findDetailPokemonIndex(id);
  catchPokemon(card);
}

function findDetailPokemonIndex(id) {
  return detailPokemon.findIndex((pokemon) => pokemon.id === id);
}

function startLoading(amount) {
  isLoading = true;
  setLoadControlsDisabled(true);
  loadingText.textContent = getLoadingText(amount);
  loadingScreen.classList.add("show");
  loadingScreen.setAttribute("aria-hidden", "false");
}

function stopLoading() {
  isLoading = false;
  loadingScreen.classList.remove("show");
  loadingScreen.setAttribute("aria-hidden", "true");
  updateLoadControls();
}

function getLoadingText(amount) {
  if (amount === MAX_POKEMON) return "Loading all remaining Pokémon...";
  return `Loading ${amount} Pokémon...`;
}

function startCustomLoading(text) {
  isLoading = true;
  setLoadControlsDisabled(true);
  loadingText.textContent = text;
  loadingScreen.classList.add("show");
  loadingScreen.setAttribute("aria-hidden", "false");
}

function updateLoadedCounter() {
  const amount = getContentIds().length;
  loadedCounter.textContent = `${amount} of ${MAX_POKEMON} Pokémon loaded`;
}

function updateLoadControls() {
  const allLoaded = getContentIds().length >= MAX_POKEMON;
  setLoadControlsDisabled(allLoaded || isLoading);
}

function setLoadControlsDisabled(disabled) {
  loadMoreButton.disabled = disabled;
  loadCountSelect.disabled = disabled;
  loadButtonStage.classList.toggle("disabled-state", disabled);
  if (disabled) closeLoadButtonPeek();
}

function catchPokemon(card) {
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
  openPokemonDialog();
}

async function openPokemonDialog() {
  startCustomLoading("Loading Pokémon details...");
  try {
    await preparePokemonRelations(getCurrentPokemon());
    stopLoading();
    showPokemonDialog();
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

function showPokemonDialog() {
  updatePokemonDetail();
  resetDetailCarousel();
  if (!pokemonDialog.open) pokemonDialog.showModal();
  document.body.classList.add("dialog-open");
  restartDetailAnimation();
}

function updatePokemonDetail() {
  const pokemon = detailPokemon[currentPokemonIndex];
  updateDetailHeader(pokemon);
  updateDetailImages(pokemon);
  updateDetailProfile(pokemon);
  updateDetailStats(pokemon);
  updateDetailMoves(pokemon);
  updateDetailColor(pokemon.types[0]);
  updateEvolutionSection(pokemon);
}

function updateDetailHeader(pokemon) {
  document.getElementById("detailPokemonId").textContent =
    formatPokemonId(pokemon.id);
  document.getElementById("detailPokemonName").textContent =
    capitalizePokemonWord(pokemon.name);
}

function updateDetailImages(pokemon) {
  setImage("detailOfficialImage", pokemon.images.official, pokemon.name);
  setImage("detailSpriteImage", pokemon.images.sprite, pokemon.name);
  setImage("detailHomeImage", pokemon.images.home, pokemon.name);
}

function setImage(id, src, name) {
  const image = document.getElementById(id);
  image.src = src || "";
  image.alt = capitalizePokemonWord(name);
  image.style.display = src ? "block" : "none";
}

function updateDetailProfile(pokemon) {
  renderDetailTypes(pokemon.types);
  renderDetailAbilities(pokemon.abilities);
  setText("detailHeight", `${pokemon.height / 10} m`);
  setText("detailWeight", `${pokemon.weight / 10} kg`);
}

function renderDetailTypes(types) {
  const html = types.map(getDetailTypeTemplate).join("");
  document.getElementById("detailProfileTypes").innerHTML = html;
}

function renderDetailAbilities(abilities) {
  const html = abilities.map(getDetailAbilityTemplate).join("");
  document.getElementById("detailAbilities").innerHTML = html;
}

function updateDetailStats(pokemon) {
  updateStat("Hp", getStatValue(pokemon, "hp"));
  updateStat("Attack", getStatValue(pokemon, "attack"));
  updateStat("Defense", getStatValue(pokemon, "defense"));
  updateStat("SpecialAttack", getStatValue(pokemon, "special-attack"));
  updateStat("SpecialDefense", getStatValue(pokemon, "special-defense"));
  updateStat("Speed", getStatValue(pokemon, "speed"));
}

function updateStat(name, value) {
  setText(`stat${name}`, value);
  const percent = Math.min((value / 255) * 100, 100);
  document.getElementById(`bar${name}`).style.width = `${percent}%`;
}

function getStatValue(pokemon, statName) {
  const stat = pokemon.stats.find((item) => item.name === statName);
  return stat ? stat.value : "-";
}

function updateDetailMoves(pokemon) {
  const moveContainer = document.getElementById("detailMoves");
  moveContainer.innerHTML = pokemon.moves.map(getMoveTemplate).join("");
}

function formatWords(words) {
  return words.map(capitalizePokemonWord).join(", ");
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function updateDetailColor(type) {
  detailCard.classList.remove(...typeClasses);
  detailCard.classList.add(`type-${type}`);
}


async function preparePokemonRelations(pokemon) {
  await loadNeighborPokemon(pokemon.id);
  const evolution = await getPokemonEvolution(pokemon.id);
  await loadEvolutionPokemonList(evolution);
}

async function loadNeighborPokemon(id) {
  const ids = getNeighborPokemonIds(id);
  for (const pokemonId of ids) {
    await loadPokemonById(pokemonId);
  }
}

function getNeighborPokemonIds(id) {
  const ids = [];
  if (id > 1) ids.push(id - 1);
  if (id < MAX_POKEMON) ids.push(id + 1);
  return ids;
}

async function loadEvolutionPokemonList(evolution) {
  for (const item of evolution) {
    await loadPokemonById(item.id);
  }
}

async function updateEvolutionSection(pokemon) {
  resetEvolutionSection();
  try {
    const evolution = await getPokemonEvolution(pokemon.id);
    if (getCurrentPokemon().id !== pokemon.id) return;
    renderEvolutionSection(pokemon.id, evolution);
  } catch (error) {
    showEvolutionError();
  }
}

function resetEvolutionSection() {
  evolutionStatus.textContent = "Loading evolution data...";
  evolutionChainList.innerHTML = "";
  setEvolutionButton(previousEvolutionButton, null);
  setEvolutionButton(nextEvolutionButton, null);
}

async function getPokemonEvolution(id) {
  const savedEvolution = getEvolutionFromDatabase(id);
  if (savedEvolution) return savedEvolution;
  const species = await fetchJson(SPECIES_URL + id);
  const evolutionData = await fetchJson(species.evolution_chain.url);
  return savePreparedEvolution(evolutionData.chain);
}

function savePreparedEvolution(chain) {
  const evolution = prepareEvolutionChain(chain);
  saveEvolutionChain(evolution);
  return evolution;
}

function prepareEvolutionChain(chain) {
  const queue = [{ link: chain, previousId: null }];
  const evolution = [];
  while (queue.length > 0) addEvolutionLink(queue, evolution);
  return evolution;
}

function addEvolutionLink(queue, evolution) {
  const current = queue.shift();
  const id = getIdFromUrl(current.link.species.url);
  const nextIds = current.link.evolves_to.map(getEvolutionId);
  evolution.push(getEvolutionItem(current, id, nextIds));
  addNextEvolutionLinks(queue, current.link.evolves_to, id);
}

function getEvolutionItem(current, id, nextIds) {
  return {
    id: id,
    name: current.link.species.name,
    previousId: current.previousId,
    nextIds: nextIds,
  };
}

function addNextEvolutionLinks(queue, nextLinks, previousId) {
  nextLinks.forEach((link) => queue.push({ link, previousId }));
}

function getEvolutionId(link) {
  return getIdFromUrl(link.species.url);
}

function getIdFromUrl(url) {
  const parts = url.split("/").filter((part) => part);
  return Number(parts[parts.length - 1]);
}

function renderEvolutionSection(currentId, evolution) {
  evolutionStatus.textContent = "Select an evolution to open it.";
  evolutionChainList.innerHTML = evolution
    .map((item) => getEvolutionTemplate(item, currentId)).join("");
  updateEvolutionButtons(currentId, evolution);
}

function updateEvolutionButtons(currentId, evolution) {
  const current = evolution.find((item) => item.id === currentId);
  if (!current) return;
  setEvolutionButton(previousEvolutionButton, current.previousId);
  setNextEvolutionButton(current.nextIds);
}

function setNextEvolutionButton(nextIds) {
  if (nextIds.length === 1) return setEvolutionButton(nextEvolutionButton, nextIds[0]);
  setEvolutionButton(nextEvolutionButton, null);
  if (nextIds.length > 1) nextEvolutionButton.textContent = "Choose Evolution";
}

function setEvolutionButton(button, id) {
  button.dataset.evolutionId = id || "";
  button.disabled = !id;
  button.textContent = getEvolutionButtonText(button, id);
}

function getEvolutionButtonText(button, id) {
  if (button === previousEvolutionButton) return "Previous Evolution";
  if (!id) return "Next Evolution";
  return "Next Evolution";
}

async function openEvolutionPokemon(id) {
  startCustomLoading("Loading evolution...");
  try {
    const pokemon = await loadPokemonById(id);
    addDetailPokemon(pokemon);
    currentPokemonIndex = findDetailPokemonIndex(id);
    await preparePokemonRelations(pokemon);
    stopLoading();
    showPokemonDialog();
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

function addDetailPokemon(pokemon) {
  const exists = detailPokemon.find((item) => item.id === pokemon.id);
  if (!exists) detailPokemon.push(pokemon);
  detailPokemon.sort(sortPokemonById);
}

function getCurrentPokemon() {
  return detailPokemon[currentPokemonIndex];
}

function showEvolutionError() {
  evolutionStatus.textContent = "Evolution data could not be loaded.";
  evolutionChainList.innerHTML = "";
  showErrorDialog();
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("API data could not be loaded.");
  return await response.json();
}

async function showPreviousPokemon() {
  currentPokemonIndex = getPreviousIndex();
  await refreshDetailPokemon();
}

async function showNextPokemon() {
  currentPokemonIndex = getNextIndex();
  await refreshDetailPokemon();
}

async function refreshDetailPokemon() {
  startCustomLoading("Loading Pokémon details...");
  try {
    await preparePokemonRelations(getCurrentPokemon());
    stopLoading();
    updatePokemonDetail();
    restartDetailAnimation();
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

function getPreviousIndex() {
  if (currentPokemonIndex === 0) return detailPokemon.length - 1;
  return currentPokemonIndex - 1;
}

function getNextIndex() {
  if (currentPokemonIndex === detailPokemon.length - 1) return 0;
  return currentPokemonIndex + 1;
}

function closePokemonDialog() {
  pokemonDialog.close();
}

function closeDialogOnBackdrop(event) {
  if (event.target === pokemonDialog) closePokemonDialog();
}

function unlockPage() {
  document.body.classList.remove("dialog-open");
  reopenSearchResultsAfterDetail();
}

function restartDetailAnimation() {
  detailCard.classList.remove("pop-out");
  void detailCard.offsetWidth;
  detailCard.classList.add("pop-out");
}

function showErrorDialog() {
  if (!errorDialog.open) errorDialog.showModal();
}

function closeErrorDialog() {
  errorDialog.close();
}

function addLoadButtonPeekEvents() {
  loadButtonStage.addEventListener("mouseenter", openLoadButtonPeek);
  loadMoreButton.addEventListener("click", closeLoadButtonPeek);
  document.addEventListener("mousemove", watchMouseNearLoadButton);
}

function openLoadButtonPeek() {
  if (loadMoreButton.disabled) return;
  clearTimeout(loadButtonTimer);
  loadButtonStage.classList.add("peek-active");
  loadButtonTimer = setTimeout(closeLoadButtonPeek, 2000);
}

function closeLoadButtonPeek() {
  clearTimeout(loadButtonTimer);
  loadButtonStage.classList.remove("peek-active");
  resetLoadButtonEyes();
}

function watchMouseNearLoadButton(event) {
  if (!loadButtonStage.classList.contains("peek-active")) return;
  if (!isMouseNearLoadButton(event)) return resetLoadButtonEyes();
  loadBackgroundEyes.forEach((eye) => followMouseWithEye(eye, event));
}

function isMouseNearLoadButton(event) {
  const rect = loadButtonStage.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return Math.hypot(event.clientX - centerX, event.clientY - centerY) < 280;
}

function followMouseWithEye(eye, event) {
  const rect = eye.getBoundingClientRect();
  const x = event.clientX - (rect.left + rect.width / 2);
  const y = event.clientY - (rect.top + rect.height / 2);
  calculatePupilPosition(eye, x, y);
}

function calculatePupilPosition(eye, x, y) {
  const angle = Math.atan2(y, x);
  const moveX = Math.cos(angle) * 7;
  const moveY = Math.sin(angle) * 7;
  applyPupilPosition(eye, moveX, moveY);
}

function applyPupilPosition(eye, x, y) {
  const pupil = eye.querySelector(".load-background-pupil");
  pupil.style.transform =
    `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
}

function resetLoadButtonEyes() {
  loadBackgroundEyes.forEach((eye) => {
    const pupil = eye.querySelector(".load-background-pupil");
    pupil.style.transform = "translate(-50%, -50%)";
  });
}

init();
