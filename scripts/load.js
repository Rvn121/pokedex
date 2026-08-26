"use strict";

function initLoadMore() {
  loadMoreButton.addEventListener("click", loadSelectedPokemonAmount);
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

async function loadSelectedPokemonAmount() {
  await loadPokemonAmount(loadCountSelect.value);
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
    await loadPokemonIds(ids);
    saveContentIds(ids);
    renderDatabase();
  } catch (error) {
    showErrorDialog();
  } finally {
    stopLoading();
  }
}

async function loadPokemonIds(ids) {
  for (const id of ids) {
    await loadPokemonById(id);
  }
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

function startLoading(amount) {
  startCustomLoading(`Loading ${amount} Pokémon...`);
}

function startCustomLoading(text) {
  isLoading = true;
  setLoadControlsDisabled(true);
  loadingText.textContent = text;
  loadingScreen.classList.add("show");
  loadingScreen.setAttribute("aria-hidden", "false");
}

function stopLoading() {
  isLoading = false;
  loadingScreen.classList.remove("show");
  loadingScreen.setAttribute("aria-hidden", "true");
  updateLoadControls();
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
  setLoadButtonDisabledStyle(disabled);
}

function setLoadButtonDisabledStyle(disabled) {
  if (disabled) loadButtonStage.classList.add("disabled-state");
  if (!disabled) loadButtonStage.classList.remove("disabled-state");
  if (disabled) closeLoadButtonPeek();
}
