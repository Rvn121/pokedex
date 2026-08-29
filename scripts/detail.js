"use strict";

const detailSectionTabs = document.querySelectorAll(".detail-section-tab");
const typeClasses = [
  "type-normal", "type-fire", "type-water", "type-grass", "type-electric",
  "type-ice", "type-fighting", "type-poison", "type-ground", "type-flying",
  "type-psychic", "type-bug", "type-rock", "type-ghost", "type-dragon",
  "type-dark", "type-steel", "type-fairy",
];

/** DE: Initialisiert alle Ereignisse für Dialog, Pokémon-Navigation und Detail-Tabs. | EN: Initializes all events for the dialog, Pokémon navigation and detail tabs. */
function initDetail() {
  addDialogEvents();
  addNavigationEvents();
  addDetailTabEvents();
}

/** DE: Verknüpft die Schließen-Funktionen und den Klick neben den Dialog mit den passenden Ereignissen. | EN: Connects the close functions and backdrop click with the matching dialog events. */
function addDialogEvents() {
  closeDialogButton.addEventListener("click", closePokemonDialog);
  closeErrorButton.addEventListener("click", closeErrorDialog);
  pokemonDialog.addEventListener("click", closeDialogOnBackdrop);
  pokemonDialog.addEventListener("close", unlockPage);
}

/** DE: Verknüpft die beiden Pfeilbuttons mit dem vorherigen und nächsten Pokémon. | EN: Connects the previous and next arrow buttons with Pokémon navigation. */
function addNavigationEvents() {
  prevPokemonButton.addEventListener("click", showPreviousPokemon);
  nextPokemonButton.addEventListener("click", showNextPokemon);
}

/** DE: Fügt jedem Tab der Detailansicht ein Klick-Ereignis hinzu. | EN: Adds a click event to every tab in the detail view. */
function addDetailTabEvents() {
  detailSectionTabs.forEach(addDetailTabEvent);
}

/** DE: Verknüpft einen einzelnen Detail-Tab mit seiner Position im Tab-Bereich. | EN: Connects one detail tab with its position in the tab area. */
function addDetailTabEvent(tab, index) {
  tab.addEventListener("click", () => setActiveDetailTab(index));
}

/** DE: Entfernt die bisherige Hervorhebung und markiert den ausgewählten Detail-Tab als aktiv. | EN: Removes the previous highlight and marks the selected detail tab as active. */
function setActiveDetailTab(index) {
  detailSectionTabs.forEach(removeActiveDetailTab);
  detailSectionTabs[index].classList.add("active");
}

/** DE: Entfernt die active-Klasse von einem Detail-Tab. | EN: Removes the active class from one detail tab. */
function removeActiveDetailTab(tab) {
  tab.classList.remove("active");
}

/** DE: Setzt die Detailansicht durch einen Klick auf den ersten Tab wieder auf Profile zurück. | EN: Resets the detail view to Profile by clicking the first tab. */
function resetDetailCarousel() {
  detailSectionTabs[0].click();
}

/** DE: Fügt allen Pokémon-Karten im normalen Contentbereich ein Klick-Ereignis hinzu. | EN: Adds a click event to all Pokémon cards in the normal content area. */
function addCardEvents() {
  const cards = pokemonList.querySelectorAll('[data-id="card"]');
  cards.forEach((card) => card.addEventListener("click", openClickedCard));
}

/** DE: Bereitet die angeklickte Content-Karte vor und startet anschließend die Fang-Animation. | EN: Prepares the clicked content card and then starts the catch animation. */
function openClickedCard(event) {
  const card = event.currentTarget;
  const id = Number(card.getAttribute("data-pokemon-id"));
  returnToSearchResults = false;
  detailPokemon = renderedPokemon;
  currentPokemonIndex = findDetailPokemonIndex(id);
  catchPokemon(card);
}

/** DE: Sucht die Position eines Pokémon innerhalb der aktuell verwendeten Detail-Liste. | EN: Finds a Pokémon position inside the currently used detail list. */
function findDetailPokemonIndex(id) {
  return detailPokemon.findIndex((pokemon) => pokemon.id === id);
}

/** DE: Startet die Pokéball-Fanganimation und öffnet danach die Detailansicht. | EN: Starts the Pokéball catch animation and opens the detail view afterwards. */
function catchPokemon(card) {
  placeCatchBall(card);
  card.classList.add("is-caught");
  setTimeout(moveCatchBallToCenter, 100);
  setTimeout(() => finishCatch(card), 900);
}

/** DE: Positioniert den Fang-Pokéball zunächst in der Mitte der angeklickten Karte. | EN: Positions the catch Pokéball in the center of the clicked card. */
function placeCatchBall(card) {
  const rect = card.getBoundingClientRect();
  catchBall.style.left = `${rect.left + rect.width / 2}px`;
  catchBall.style.top = `${rect.top + rect.height / 2}px`;
  catchBall.classList.remove("roll");
  catchBall.classList.add("show");
}

/** DE: Bewegt den Fang-Pokéball von der Karte in die Mitte des Bildschirms. | EN: Moves the catch Pokéball from the card to the center of the screen. */
function moveCatchBallToCenter() {
  catchBall.style.left = "50%";
  catchBall.style.top = "50%";
  catchBall.classList.add("roll");
}

/** DE: Beendet die Fanganimation und startet anschließend das Öffnen der Detailansicht. | EN: Finishes the catch animation and then starts opening the detail view. */
function finishCatch(card) {
  card.classList.remove("is-caught");
  catchBall.classList.remove("show", "roll");
  openPokemonDialog();
}

/** DE: Lädt benötigte Nachbar- und Evolutionsdaten und öffnet danach die Detailansicht. | EN: Loads required neighbour and evolution data and then opens the detail view. */
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

/** DE: Befüllt und öffnet den Detaildialog und startet seine Einblendanimation. | EN: Fills and opens the detail dialog and starts its entrance animation. */
function showPokemonDialog() {
  updatePokemonDetail();
  resetDetailCarousel();
  pokemonDialog.showModal();
  document.body.classList.add("dialog-open");
  restartDetailAnimation();
}

/** DE: Aktualisiert alle sichtbaren Daten des aktuell ausgewählten Pokémon in der Detailansicht. | EN: Updates all visible data of the currently selected Pokémon in the detail view. */
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

/** DE: Schreibt ID und Namen des Pokémon in den Kopfbereich der Detailkarte. | EN: Writes the Pokémon ID and name into the detail card header. */
function updateDetailHeader(pokemon) {
  setText("detailPokemonId", formatPokemonId(pokemon.id));
  setText("detailPokemonName", capitalizePokemonWord(pokemon.name));
}

/** DE: Setzt die verschiedenen Pokémon-Bilder im Bilder-Carousel. | EN: Sets the different Pokémon images in the image carousel. */
function updateDetailImages(pokemon) {
  setImage("detailOfficialImage", pokemon.images.official, pokemon.name);
  setImage("detailSpriteImage", pokemon.images.sprite, pokemon.name);
  setImage("detailHomeImage", pokemon.images.home, pokemon.name);
}

/** DE: Setzt Quelle und Alternativtext eines Bildes und blendet es aus, wenn kein Bild vorhanden ist. | EN: Sets image source and alt text and hides the image if no source exists. */
function setImage(id, src, name) {
  const image = document.getElementById(id);
  image.src = src || "";
  image.alt = capitalizePokemonWord(name);
  image.style.display = src ? "block" : "none";
}

/** DE: Füllt im Profil Typen, Fähigkeiten, Größe und Gewicht des Pokémon. | EN: Fills the profile with types, abilities, height and weight. */
function updateDetailProfile(pokemon) {
  renderDetailTypes(pokemon.types);
  renderDetailAbilities(pokemon.abilities);
  setText("detailHeight", `${pokemon.height / 10} m`);
  setText("detailWeight", `${pokemon.weight / 10} kg`);
}

/** DE: Erstellt die HTML-Ausgabe für die Pokémon-Typen im Profil. | EN: Creates the HTML output for the Pokémon types in the profile. */
function renderDetailTypes(types) {
  const html = types.map(getDetailTypeTemplate).join("");
  document.getElementById("detailProfileTypes").innerHTML = html;
}

/** DE: Erstellt die HTML-Ausgabe für die Fähigkeiten des Pokémon. | EN: Creates the HTML output for the Pokémon abilities. */
function renderDetailAbilities(abilities) {
  const html = abilities.map(getDetailAbilityTemplate).join("");
  document.getElementById("detailAbilities").innerHTML = html;
}

/** DE: Überträgt alle sechs Basiswerte des Pokémon in die Detailansicht. | EN: Transfers all six Pokémon base stats into the detail view. */
function updateDetailStats(pokemon) {
  updateStat("Hp", getStatValue(pokemon, "hp"));
  updateStat("Attack", getStatValue(pokemon, "attack"));
  updateStat("Defense", getStatValue(pokemon, "defense"));
  updateStat("SpecialAttack", getStatValue(pokemon, "special-attack"));
  updateStat("SpecialDefense", getStatValue(pokemon, "special-defense"));
  updateStat("Speed", getStatValue(pokemon, "speed"));
}

/** DE: Setzt einen Basiswert und berechnet die Breite seines Fortschrittsbalkens. | EN: Sets one base stat and calculates the width of its progress bar. */
function updateStat(name, value) {
  setText(`stat${name}`, value);
  let percent = (value / 255) * 100;
  if (percent > 100) percent = 100;
  document.getElementById(`bar${name}`).style.width = `${percent}%`;
}

/** DE: Sucht einen bestimmten Basiswert und gibt dessen Zahlenwert zurück. | EN: Finds a specific base stat and returns its numeric value. */
function getStatValue(pokemon, statName) {
  const index = pokemon.stats.findIndex((item) => item.name === statName);
  if (index === -1) return "-";
  return pokemon.stats[index].value;
}

/** DE: Erstellt die sichtbare Liste der gespeicherten Pokémon-Attacken. | EN: Creates the visible list of stored Pokémon moves. */
function updateDetailMoves(pokemon) {
  const moveContainer = document.getElementById("detailMoves");
  moveContainer.innerHTML = pokemon.moves.map(getMoveTemplate).join("");
}

/** DE: Schreibt einen übergebenen Wert als Text in ein Element mit der passenden ID. | EN: Writes a provided value as text into the element with the matching ID. */
function setText(id, value) {
  document.getElementById(id).textContent = value;
}

/** DE: Entfernt alte Typfarben und setzt die Farbe passend zum Haupttyp des Pokémon. | EN: Removes old type colours and applies the colour of the Pokémon primary type. */
function updateDetailColor(type) {
  typeClasses.forEach(removeDetailTypeClass);
  detailCard.classList.add(`type-${type}`);
}

/** DE: Entfernt eine einzelne Typklasse von der Detailkarte. | EN: Removes one type class from the detail card. */
function removeDetailTypeClass(typeClass) {
  detailCard.classList.remove(typeClass);
}

/** DE: Wechselt zum vorherigen Pokémon der aktuellen Detail-Liste. | EN: Switches to the previous Pokémon in the current detail list. */
async function showPreviousPokemon() {
  currentPokemonIndex = getPreviousIndex();
  await refreshDetailPokemon();
}

/** DE: Wechselt zum nächsten Pokémon der aktuellen Detail-Liste. | EN: Switches to the next Pokémon in the current detail list. */
async function showNextPokemon() {
  currentPokemonIndex = getNextIndex();
  await refreshDetailPokemon();
}

/** DE: Lädt benötigte Zusatzdaten des neu ausgewählten Pokémon und aktualisiert die Detailansicht. | EN: Loads additional data for the newly selected Pokémon and updates the detail view. */
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

/** DE: Berechnet die Position des vorherigen Pokémon und springt am Anfang zum letzten Eintrag. | EN: Calculates the previous Pokémon position and wraps from the first to the last entry. */
function getPreviousIndex() {
  if (currentPokemonIndex === 0) return detailPokemon.length - 1;
  return currentPokemonIndex - 1;
}

/** DE: Berechnet die Position des nächsten Pokémon und springt am Ende zum ersten Eintrag. | EN: Calculates the next Pokémon position and wraps from the last to the first entry. */
function getNextIndex() {
  if (currentPokemonIndex === detailPokemon.length - 1) return 0;
  return currentPokemonIndex + 1;
}

/** DE: Fügt ein Pokémon zur aktuellen Detail-Liste hinzu, wenn es dort noch nicht enthalten ist. | EN: Adds a Pokémon to the current detail list if it is not already included. */
function addDetailPokemon(pokemon) {
  const index = findDetailPokemonIndex(pokemon.id);
  if (index === -1) detailPokemon.push(pokemon);
  detailPokemon.sort(sortPokemonById);
}

/** DE: Gibt das Pokémon zurück, das aktuell in der Detailansicht ausgewählt ist. | EN: Returns the Pokémon currently selected in the detail view. */
function getCurrentPokemon() {
  return detailPokemon[currentPokemonIndex];
}

/** DE: Schließt den Pokémon-Detaildialog. | EN: Closes the Pokémon detail dialog. */
function closePokemonDialog() {
  pokemonDialog.close();
}

/** DE: Schließt die Detailansicht, wenn direkt neben die Karte auf den Dialog-Hintergrund geklickt wird. | EN: Closes the detail view when the dialog backdrop beside the card is clicked. */
function closeDialogOnBackdrop(event) {
  if (event.target === pokemonDialog) closePokemonDialog();
}

/** DE: Gibt die Seite nach dem Schließen frei und öffnet bei einer Suche wieder das Suchergebnis. | EN: Unlocks the page after closing and reopens search results when required. */
function unlockPage() {
  document.body.classList.remove("dialog-open");
  reopenSearchResultsAfterDetail();
}

/** DE: Entfernt kurz die Animationsklasse, damit die Einblendanimation erneut abgespielt werden kann. | EN: Briefly removes the animation class so the entrance animation can run again. */
function restartDetailAnimation() {
  detailCard.classList.remove("pop-out");
  setTimeout(showDetailAnimation, 10);
}

/** DE: Fügt die Animationsklasse wieder hinzu und startet dadurch die Detailkarten-Animation. | EN: Adds the animation class again and starts the detail card animation. */
function showDetailAnimation() {
  detailCard.classList.add("pop-out");
}

/** DE: Öffnet den allgemeinen Fehlerdialog. | EN: Opens the general error dialog. */
function showErrorDialog() {
  errorDialog.showModal();
}

/** DE: Schließt den allgemeinen Fehlerdialog. | EN: Closes the general error dialog. */
function closeErrorDialog() {
  errorDialog.close();
}
