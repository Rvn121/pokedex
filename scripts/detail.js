"use strict";

const detailSectionTabs = document.querySelectorAll(".detail-section-tab");
const typeClasses = [
  "type-normal", "type-fire", "type-water", "type-grass", "type-electric",
  "type-ice", "type-fighting", "type-poison", "type-ground", "type-flying",
  "type-psychic", "type-bug", "type-rock", "type-ghost", "type-dragon",
  "type-dark", "type-steel", "type-fairy",
];

// Initialisiert alle Ereignisse für Dialog, Pokémon-Navigation und Detail-Tabs.
function initDetail() {
  addDialogEvents();
  addNavigationEvents();
  addDetailTabEvents();
}



// Verknüpft die beiden Pfeilbuttons mit dem vorherigen und nächsten Pokémon.
function addNavigationEvents() {
  prevPokemonButton.addEventListener("click", showPreviousPokemon);
  nextPokemonButton.addEventListener("click", showNextPokemon);
}

// Fügt jedem Tab der Detailansicht ein Klick-Ereignis hinzu.
function addDetailTabEvents() {
  detailSectionTabs.forEach(addDetailTabEvent);
}

// Verknüpft einen einzelnen Detail-Tab mit seiner Position im Tab-Bereich.
function addDetailTabEvent(tab, index) {
  tab.addEventListener("click", () => setActiveDetailTab(index));
}

// Entfernt die bisherige Hervorhebung und markiert den ausgewählten Detail-Tab als aktiv.
function setActiveDetailTab(index) {
  detailSectionTabs.forEach(removeActiveDetailTab);
  detailSectionTabs[index].classList.add("active");
}

// Entfernt die active-Klasse von einem Detail-Tab.
function removeActiveDetailTab(tab) {
  tab.classList.remove("active");
}

// Setzt die Detailansicht durch einen Klick auf den ersten Tab wieder auf Profile zurück.
function resetDetailCarousel() {
  detailSectionTabs[0].click();
}

// Fügt allen Pokémon-Karten im normalen Contentbereich ein Klick-Ereignis hinzu.
function addCardEvents() {
  const cards = pokemonList.querySelectorAll('[data-id="card"]');
  cards.forEach((card) => card.addEventListener("click", openClickedCard));
}

// Bereitet die angeklickte Content-Karte vor und startet anschließend die Fang-Animation.
function openClickedCard(event) {
  const card = event.currentTarget;
  const id = Number(card.dataset.pokemonId);
  returnToSearchResults = false;
  detailPokemon = renderedPokemon;
  currentPokemonIndex = findDetailPokemonIndex(id);
  catchPokemon(card);
}

// Sucht die Position eines Pokémon innerhalb der aktuell verwendeten Detail-Liste.
function findDetailPokemonIndex(id) {
  return detailPokemon.findIndex((pokemon) => pokemon.id === id);
}

// Startet die Pokéball-Fanganimation und öffnet danach die Detailansicht.
function catchPokemon(card) {
  placeCatchBall(card);
  card.classList.add("is-caught");
  setTimeout(moveCatchBallToCenter, 100);
  setTimeout(() => finishCatch(card), 900);
}

// Positioniert den Fang-Pokéball zunächst in der Mitte der angeklickten Karte.
function placeCatchBall(card) {
  const rect = card.getBoundingClientRect();
  catchBall.style.left = `${rect.left + rect.width / 2}px`;
  catchBall.style.top = `${rect.top + rect.height / 2}px`;
  catchBall.classList.remove("roll");
  catchBall.classList.add("show");
}

// Bewegt den Fang-Pokéball von der Karte in die Mitte des Bildschirms.
function moveCatchBallToCenter() {
  catchBall.style.left = "50%";
  catchBall.style.top = "50%";
  catchBall.classList.add("roll");
}

// Beendet die Fanganimation und startet anschließend das Öffnen der Detailansicht.
function finishCatch(card) {
  card.classList.remove("is-caught");
  catchBall.classList.remove("show", "roll");
  openPokemonDialog();
}

// Lädt benötigte Nachbar- und Evolutionsdaten und öffnet danach die Detailansicht.
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

// Befüllt und öffnet den Detaildialog und startet seine Einblendanimation.
function showPokemonDialog() {
  updatePokemonDetail();
  resetDetailCarousel();
  if (!pokemonDialog.open) pokemonDialog.showModal();
  document.body.classList.add("dialog-open");
  restartDetailAnimation();
}

// Aktualisiert alle sichtbaren Daten des aktuell ausgewählten Pokémon in der Detailansicht.
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

// Schreibt ID und Namen des Pokémon in den Kopfbereich der Detailkarte.
function updateDetailHeader(pokemon) {
  setText("detailPokemonId", formatPokemonId(pokemon.id));
  setText("detailPokemonName", capitalizePokemonWord(pokemon.name));
}

// Setzt die verschiedenen Pokémon-Bilder im Bilder-Carousel.
function updateDetailImages(pokemon) {
  setImage("detailOfficialImage", pokemon.images.official, pokemon.name);
  setImage("detailSpriteImage", pokemon.images.sprite, pokemon.name);
  setImage("detailHomeImage", pokemon.images.home, pokemon.name);
}

// Setzt Quelle und Alternativtext eines Bildes und blendet es aus, wenn kein Bild vorhanden ist.
function setImage(id, src, name) {
  const image = document.getElementById(id);
  image.src = src || "";
  image.alt = capitalizePokemonWord(name);
  image.style.display = src ? "block" : "none";
}

// Füllt im Profil Typen, Fähigkeiten, Größe und Gewicht des Pokémon.
function updateDetailProfile(pokemon) {
  renderDetailTypes(pokemon.types);
  renderDetailAbilities(pokemon.abilities);
  setText("detailHeight", `${pokemon.height / 10} m`);
  setText("detailWeight", `${pokemon.weight / 10} kg`);
}

// Erstellt die HTML-Ausgabe für die Pokémon-Typen im Profil.
function renderDetailTypes(types) {
  const html = types.map(getDetailTypeTemplate).join("");
  document.getElementById("detailProfileTypes").innerHTML = html;
}

// Erstellt die HTML-Ausgabe für die Fähigkeiten des Pokémon.
function renderDetailAbilities(abilities) {
  const html = abilities.map(getDetailAbilityTemplate).join("");
  document.getElementById("detailAbilities").innerHTML = html;
}

// Überträgt alle sechs Basiswerte des Pokémon in die Detailansicht.
function updateDetailStats(pokemon) {
  updateStat("Hp", getStatValue(pokemon, "hp"));
  updateStat("Attack", getStatValue(pokemon, "attack"));
  updateStat("Defense", getStatValue(pokemon, "defense"));
  updateStat("SpecialAttack", getStatValue(pokemon, "special-attack"));
  updateStat("SpecialDefense", getStatValue(pokemon, "special-defense"));
  updateStat("Speed", getStatValue(pokemon, "speed"));
}

// Setzt einen Basiswert und berechnet die Breite seines Fortschrittsbalkens.
function updateStat(name, value) {
  setText(`stat${name}`, value);
  const percent = Math.min((value / 255) * 100, 100);
  document.getElementById(`bar${name}`).style.width = `${percent}%`;
}

// Sucht einen bestimmten Basiswert und gibt dessen Zahlenwert zurück.
function getStatValue(pokemon, statName) {
  const index = pokemon.stats.findIndex((item) => item.name === statName);
  if (index === -1) return "-";
  return pokemon.stats[index].value;
}

// Erstellt die sichtbare Liste der gespeicherten Pokémon-Attacken.
function updateDetailMoves(pokemon) {
  const moveContainer = document.getElementById("detailMoves");
  moveContainer.innerHTML = pokemon.moves.map(getMoveTemplate).join("");
}

// Schreibt einen übergebenen Wert als Text in ein Element mit der passenden ID.
function setText(id, value) {
  document.getElementById(id).textContent = value;
}

// Entfernt alte Typfarben und setzt die Farbe passend zum Haupttyp des Pokémon.
function updateDetailColor(type) {
  typeClasses.forEach(removeDetailTypeClass);
  detailCard.classList.add(`type-${type}`);
}

// Entfernt eine einzelne Typklasse von der Detailkarte.
function removeDetailTypeClass(typeClass) {
  detailCard.classList.remove(typeClass);
}

// Wechselt zum vorherigen Pokémon der aktuellen Detail-Liste.
async function showPreviousPokemon() {
  currentPokemonIndex = getPreviousIndex();
  await refreshDetailPokemon();
}

// Wechselt zum nächsten Pokémon der aktuellen Detail-Liste.
async function showNextPokemon() {
  currentPokemonIndex = getNextIndex();
  await refreshDetailPokemon();
}

// Lädt benötigte Zusatzdaten des neu ausgewählten Pokémon und aktualisiert die Detailansicht.
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

// Berechnet die Position des vorherigen Pokémon und springt am Anfang zum letzten Eintrag.
function getPreviousIndex() {
  if (currentPokemonIndex === 0) return detailPokemon.length - 1;
  return currentPokemonIndex - 1;
}

// Berechnet die Position des nächsten Pokémon und springt am Ende zum ersten Eintrag.
function getNextIndex() {
  if (currentPokemonIndex === detailPokemon.length - 1) return 0;
  return currentPokemonIndex + 1;
}

// Fügt ein Pokémon zur aktuellen Detail-Liste hinzu, wenn es dort noch nicht enthalten ist.
function addDetailPokemon(pokemon) {
  const index = findDetailPokemonIndex(pokemon.id);
  if (index === -1) detailPokemon.push(pokemon);
  detailPokemon.sort(sortPokemonById);
}

// Gibt das Pokémon zurück, das aktuell in der Detailansicht ausgewählt ist.
function getCurrentPokemon() {
  return detailPokemon[currentPokemonIndex];
}

// Schließt den Pokémon-Detaildialog.
function closePokemonDialog() {
  pokemonDialog.close();
}

// Schließt die Detailansicht, wenn direkt neben die Karte auf den Dialog-Hintergrund geklickt wird.
function closeDialogOnBackdrop(event) {
  if (event.target === pokemonDialog) closePokemonDialog();
}

// Gibt die Seite nach dem Schließen frei und öffnet bei einer Suche wieder das Suchergebnis.
function unlockPage() {
  document.body.classList.remove("dialog-open");
  reopenSearchResultsAfterDetail();
}

// Entfernt kurz die Animationsklasse, damit die Einblendanimation erneut abgespielt werden kann.
function restartDetailAnimation() {
  detailCard.classList.remove("pop-out");
  setTimeout(showDetailAnimation, 10);
}

// Fügt die Animationsklasse wieder hinzu und startet dadurch die Detailkarten-Animation.
function showDetailAnimation() {
  detailCard.classList.add("pop-out");
}

// Öffnet den allgemeinen Fehlerdialog, wenn er noch nicht geöffnet ist.
function showErrorDialog() {
  if (!errorDialog.open) errorDialog.showModal();
}

// Schließt den allgemeinen Fehlerdialog.
function closeErrorDialog() {
  errorDialog.close();
}
