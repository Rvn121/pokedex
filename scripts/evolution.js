"use strict";

const previousEvolutionButton = document.getElementById("previousEvolutionButton");
const nextEvolutionButton = document.getElementById("nextEvolutionButton");
const evolutionChainList = document.getElementById("evolutionChainList");
const evolutionStatus = document.getElementById("evolutionStatus");

function initEvolution() {
  previousEvolutionButton.addEventListener("click", openEvolutionFromButton);
  nextEvolutionButton.addEventListener("click", openEvolutionFromButton);
}

function openEvolutionFromButton(event) {
  const id = Number(event.currentTarget.dataset.evolutionId);
  if (id) openEvolutionPokemon(id);
}

function addEvolutionCardEvents() {
  const buttons = evolutionChainList.querySelectorAll("[data-evolution-id]");
  buttons.forEach((button) => button.addEventListener("click", openEvolutionCard));
}

function openEvolutionCard(event) {
  const id = Number(event.currentTarget.dataset.evolutionId);
  openEvolutionPokemon(id);
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
  nextLinks.forEach((link) => addNextEvolutionLink(queue, link, previousId));
}

function addNextEvolutionLink(queue, link, previousId) {
  queue.push({
    link: link,
    previousId: previousId,
  });
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
  evolutionChainList.innerHTML = getEvolutionHtml(currentId, evolution);
  updateEvolutionButtons(currentId, evolution);
  addEvolutionCardEvents();
}

function getEvolutionHtml(currentId, evolution) {
  return evolution.map((item) => getEvolutionTemplate(item, currentId)).join("");
}

function updateEvolutionButtons(currentId, evolution) {
  const index = evolution.findIndex((item) => item.id === currentId);
  if (index === -1) return;
  setEvolutionButton(previousEvolutionButton, evolution[index].previousId);
  setNextEvolutionButton(evolution[index].nextIds);
}

function setNextEvolutionButton(nextIds) {
  if (nextIds.length === 1) return setEvolutionButton(nextEvolutionButton, nextIds[0]);
  setEvolutionButton(nextEvolutionButton, null);
  if (nextIds.length > 1) nextEvolutionButton.textContent = "Choose Evolution";
}

function setEvolutionButton(button, id) {
  button.dataset.evolutionId = id || "";
  button.disabled = !id;
  button.textContent = getEvolutionButtonText(button);
}

function getEvolutionButtonText(button) {
  if (button === previousEvolutionButton) return "Previous Evolution";
  return "Next Evolution";
}

async function openEvolutionPokemon(id) {
  startCustomLoading("Loading evolution...");
  try {
    await loadAndOpenEvolution(id);
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

async function loadAndOpenEvolution(id) {
  const pokemon = await loadPokemonById(id);
  addDetailPokemon(pokemon);
  currentPokemonIndex = findDetailPokemonIndex(id);
  await preparePokemonRelations(pokemon);
  stopLoading();
  showPokemonDialog();
}

function showEvolutionError() {
  evolutionStatus.textContent = "Evolution data could not be loaded.";
  evolutionChainList.innerHTML = "";
  showErrorDialog();
}
