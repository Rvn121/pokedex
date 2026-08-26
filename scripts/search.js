"use strict";

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const searchArea = document.getElementById("searchArea");
const searchHelpBubble = document.getElementById("searchHelpBubble");
const searchResultsDialog = document.getElementById("searchResultsDialog");
const searchResultsList = document.getElementById("searchResultsList");
const searchResultsCount = document.getElementById("searchResultsCount");
const closeSearchResultsButton = document.getElementById("closeSearchResultsButton");
const searchErrorDialog = document.getElementById("searchErrorDialog");
const searchErrorMessage = document.getElementById("searchErrorMessage");
const closeSearchErrorButton = document.getElementById("closeSearchErrorButton");
const searchErrorOkButton = document.getElementById("searchErrorOkButton");

let searchHelpTimer;
let returnToSearchResults = false;

function initSearch() {
  addSearchInputEvents();
  addSearchDialogEvents();
}

function addSearchInputEvents() {
  searchInput.addEventListener("input", checkSearchHelp);
  searchButton.addEventListener("click", startPokemonSearch);
  searchInput.addEventListener("keydown", searchWithEnter);
  searchArea.addEventListener("mouseenter", startSearchHelpTimer);
  searchArea.addEventListener("mouseleave", hideSearchHelp);
  searchInput.addEventListener("focus", startSearchHelpTimer);
  searchInput.addEventListener("blur", hideSearchHelp);
}

function addSearchDialogEvents() {
  closeSearchResultsButton.addEventListener("click", closeSearchResultsDialog);
  searchResultsDialog.addEventListener("click", closeSearchResultsOnBackdrop);
  closeSearchErrorButton.addEventListener("click", closeSearchErrorDialog);
  searchErrorOkButton.addEventListener("click", closeSearchErrorDialog);
  searchErrorDialog.addEventListener("click", closeSearchErrorOnBackdrop);
}

function checkSearchHelp() {
  if (getSearchQuery().length >= 3) hideSearchHelp();
}

function startSearchHelpTimer() {
  clearTimeout(searchHelpTimer);
  searchHelpTimer = setTimeout(showSearchHelp, 1000);
}

function showSearchHelp() {
  searchHelpBubble.classList.add("show");
  searchHelpBubble.setAttribute("aria-hidden", "false");
}

function hideSearchHelp() {
  clearTimeout(searchHelpTimer);
  searchHelpBubble.classList.remove("show");
  searchHelpBubble.setAttribute("aria-hidden", "true");
}

function searchWithEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();
  startPokemonSearch();
}

async function startPokemonSearch() {
  const query = getSearchQuery();
  if (!isValidSearchQuery(query)) return showSearchRequirement();
  hideSearchHelp();
  startCustomLoading("Searching Pokémon...");
  await runPokemonSearch(query);
}

function isValidSearchQuery(query) {
  return query.length >= 3;
}

function showSearchRequirement() {
  showSearchHelp();
  clearTimeout(searchHelpTimer);
  searchHelpTimer = setTimeout(hideSearchHelp, 3500);
}

async function runPokemonSearch(query) {
  try {
    const results = await findPokemonSearchResults(query);
    if (results.length === 0) return finishEmptySearch();
    openSearchResults(results);
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

function openSearchResults(results) {
  renderSearchPreview(results);
  stopLoading();
  if (!searchResultsDialog.open) searchResultsDialog.showModal();
}

function renderSearchPreview(results) {
  detailPokemon = results;
  searchResultsList.innerHTML = results.map(getPokemonCardTemplate).join("");
  searchResultsCount.textContent = getSearchResultCountText(results.length);
  addSearchPreviewCardEvents();
}

function addSearchPreviewCardEvents() {
  const cards = searchResultsList.querySelectorAll('[data-id="card"]');
  cards.forEach((card) => card.addEventListener("click", openSearchPreviewCard));
}

function getSearchResultCountText(amount) {
  if (amount === 1) return "1 matching Pokémon found";
  return `${amount} matching Pokémon found`;
}

async function openSearchPreviewCard(event) {
  returnToSearchResults = true;
  hideSearchResultsDialog();
  await openSearchPokemonDetail(Number(event.currentTarget.dataset.pokemonId));
}

async function openSearchPokemonDetail(id) {
  currentPokemonIndex = findDetailPokemonIndex(id);
  startCustomLoading("Loading Pokémon details...");
  await prepareSearchDetail();
}

async function prepareSearchDetail() {
  try {
    await preparePokemonRelations(getCurrentPokemon());
    stopLoading();
    showPokemonDialog();
  } catch (error) {
    stopLoading();
    showErrorDialog();
  }
}

function finishEmptySearch() {
  stopLoading();
  showSearchNotFoundDialog();
}

async function findPokemonSearchResults(query) {
  if (isNumberSearch(query)) return searchPokemonNumber(query);
  return searchPokemonName(query);
}

function isNumberSearch(query) {
  return !isNaN(query);
}

async function searchPokemonNumber(query) {
  const id = Number(query);
  if (id < 1 || id > MAX_POKEMON) return [];
  return [await loadPokemonById(id)];
}

async function searchPokemonName(query) {
  const searchIndex = await getPokemonSearchIndex();
  const matches = searchIndex.filter((pokemon) => pokemon.name.includes(query));
  return await loadSearchMatches(matches);
}

async function getPokemonSearchIndex() {
  const savedIndex = getSearchIndex();
  if (savedIndex.length > 0) return savedIndex;
  const data = await fetchJson(`${API_URL}?limit=${MAX_POKEMON}&offset=0`);
  const searchIndex = prepareSearchIndex(data.results);
  saveSearchIndex(searchIndex);
  return searchIndex;
}

function prepareSearchIndex(results) {
  return results.map(getSearchIndexItem)
    .filter((pokemon) => pokemon.id <= MAX_POKEMON);
}

function getSearchIndexItem(pokemon) {
  return {
    id: getSearchIdFromUrl(pokemon.url),
    name: pokemon.name,
  };
}

function getSearchIdFromUrl(url) {
  const parts = url.split("/").filter((part) => part);
  return Number(parts[parts.length - 1]);
}

async function loadSearchMatches(matches) {
  const pokemon = [];
  for (const match of matches) {
    pokemon.push(await loadPokemonById(match.id));
  }
  return pokemon;
}

function getSearchQuery() {
  return searchInput.value.trim().toLowerCase();
}

function closeSearchResultsDialog() {
  returnToSearchResults = false;
  hideSearchResultsDialog();
}

function hideSearchResultsDialog() {
  if (searchResultsDialog.open) searchResultsDialog.close();
}

function reopenSearchResultsAfterDetail() {
  if (!returnToSearchResults) return;
  if (!searchResultsDialog.open) searchResultsDialog.showModal();
}

function closeSearchResultsOnBackdrop(event) {
  if (event.target === searchResultsDialog) closeSearchResultsDialog();
}

function showSearchNotFoundDialog() {
  searchErrorMessage.innerHTML = getNotFoundTemplate();
  if (!searchErrorDialog.open) searchErrorDialog.showModal();
}

function closeSearchErrorDialog() {
  searchErrorDialog.close();
}

function closeSearchErrorOnBackdrop(event) {
  if (event.target === searchErrorDialog) closeSearchErrorDialog();
}
