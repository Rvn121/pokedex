"use strict";

const detailSectionTabs = document.querySelectorAll(".detail-section-tab");
const typeClasses = [
  "type-normal", "type-fire", "type-water", "type-grass", "type-electric",
  "type-ice", "type-fighting", "type-poison", "type-ground", "type-flying",
  "type-psychic", "type-bug", "type-rock", "type-ghost", "type-dragon",
  "type-dark", "type-steel", "type-fairy",
];

function initDetail() {
  addDialogEvents();
  addNavigationEvents();
  addDetailTabEvents();
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

function addDetailTabEvents() {
  detailSectionTabs.forEach(addDetailTabEvent);
}

function addDetailTabEvent(tab, index) {
  tab.addEventListener("click", () => setActiveDetailTab(index));
}

function setActiveDetailTab(index) {
  detailSectionTabs.forEach(removeActiveDetailTab);
  detailSectionTabs[index].classList.add("active");
}

function removeActiveDetailTab(tab) {
  tab.classList.remove("active");
}

function resetDetailCarousel() {
  detailSectionTabs[0].click();
}

function addCardEvents() {
  const cards = pokemonList.querySelectorAll('[data-id="card"]');
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
  const pokemon = getCurrentPokemon();
  updateDetailHeader(pokemon);
  updateDetailImages(pokemon);
  updateDetailProfile(pokemon);
  updateDetailStats(pokemon);
  updateDetailMoves(pokemon);
  updateDetailColor(pokemon.types[0]);
  updateEvolutionSection(pokemon);
}

function updateDetailHeader(pokemon) {
  setText("detailPokemonId", formatPokemonId(pokemon.id));
  setText("detailPokemonName", capitalizePokemonWord(pokemon.name));
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
  const index = pokemon.stats.findIndex((item) => item.name === statName);
  if (index === -1) return "-";
  return pokemon.stats[index].value;
}

function updateDetailMoves(pokemon) {
  const moveContainer = document.getElementById("detailMoves");
  moveContainer.innerHTML = pokemon.moves.map(getMoveTemplate).join("");
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function updateDetailColor(type) {
  typeClasses.forEach(removeDetailTypeClass);
  detailCard.classList.add(`type-${type}`);
}

function removeDetailTypeClass(typeClass) {
  detailCard.classList.remove(typeClass);
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

function addDetailPokemon(pokemon) {
  const index = findDetailPokemonIndex(pokemon.id);
  if (index === -1) detailPokemon.push(pokemon);
  detailPokemon.sort(sortPokemonById);
}

function getCurrentPokemon() {
  return detailPokemon[currentPokemonIndex];
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
  setTimeout(showDetailAnimation, 10);
}

function showDetailAnimation() {
  detailCard.classList.add("pop-out");
}

function showErrorDialog() {
  if (!errorDialog.open) errorDialog.showModal();
}

function closeErrorDialog() {
  errorDialog.close();
}
