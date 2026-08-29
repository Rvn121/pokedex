"use strict";

/** DE: Erstellt das äußere Listenelement für eine einzelne Pokémon-Karte. | EN: Creates the outer list element for one Pokémon card. */
function getPokemonCardTemplate(pokemon) {
  return `
    <li class="col">
      ${getPokemonCardButtonTemplate(pokemon)}
    </li>
  `;
}

/** DE: Erstellt den anklickbaren Button einer Pokémon-Karte inklusive Haupttyp und data-id. | EN: Creates the clickable Pokémon card button including primary type and data-id. */
function getPokemonCardButtonTemplate(pokemon) {
  const mainType = pokemon.types[0];
  return `
    <button class="pokemon-card type-${mainType} w-100 h-100"
      type="button" aria-label="Open details for ${pokemon.name}"
      data-id="card" data-pokemon-id="${pokemon.id}">
      ${getPokemonCardHeaderTemplate(pokemon)}
      ${getPokemonCardBodyTemplate(pokemon)}
    </button>
  `;
}

/** DE: Erstellt den Kopfbereich einer Karte mit Pokémon-ID und Namen. | EN: Creates the card header with Pokémon ID and name. */
function getPokemonCardHeaderTemplate(pokemon) {
  return `
    <div class="pokemon-card-head">
      <span class="pokemon-id">${formatPokemonId(pokemon.id)}</span>
      <h2 class="pokemon-name">${capitalizePokemonWord(pokemon.name)}</h2>
    </div>
  `;
}

/** DE: Erstellt den unteren Kartenbereich mit Typen und Pokémon-Bild. | EN: Creates the lower card area with types and Pokémon image. */
function getPokemonCardBodyTemplate(pokemon) {
  return `
    <div class="pokemon-card-body">
      <div class="pokemon-types">${getPokemonTypesTemplate(pokemon.types)}</div>
      ${getPokemonCardImageTemplate(pokemon)}
    </div>
  `;
}

/** DE: Erstellt das Bild-Element der kleinen Pokémon-Karte. | EN: Creates the image element for the small Pokémon card. */
function getPokemonCardImageTemplate(pokemon) {
  return `
    <img class="pokemon-image" data-id="card-image"
      src="${pokemon.images.official}" alt="${pokemon.name}"
      loading="lazy" />
  `;
}

/** DE: Erstellt aus allen Typen eines Pokémon die komplette Typen-Ausgabe. | EN: Creates the complete type output from all Pokémon types. */
function getPokemonTypesTemplate(types) {
  return types.map(getPokemonTypeTemplate).join("");
}

/** DE: Erstellt die sichtbare Plakette für einen einzelnen Pokémon-Typ. | EN: Creates the visible badge for one Pokémon type. */
function getPokemonTypeTemplate(type) {
  const name = capitalizePokemonWord(type);
  return `<span class="pokemon-type type-${type}">${name}</span>`;
}


/** DE: Erstellt eine einzelne sichtbare Attacke für den Moves-Bereich. | EN: Creates one visible move for the Moves section. */
function getMoveTemplate(move) {
  return `<span class="detail-move">${capitalizePokemonWord(move)}</span>`;
}

/** DE: Erstellt einen anklickbaren Eintrag der Evolutionskette und markiert das aktuelle Pokémon. | EN: Creates one clickable evolution entry and marks the current Pokémon. */
function getEvolutionTemplate(item, currentId) {
  const activeClass = item.id === currentId ? " active" : "";
  return `
    <button class="evolution-chain-item${activeClass}" type="button"
      data-evolution-id="${item.id}" aria-label="Show ${item.name}">
      ${capitalizePokemonWord(item.name)}
    </button>
  `;
}

/** DE: Erstellt die vorgeschriebene Kein-Treffer-Meldung mit data-id="not-found". | EN: Creates the required no-match message with data-id="not-found". */
function getNotFoundTemplate() {
  return `<p data-id="not-found">No matching Pokémon found.</p>`;
}

/** DE: Formatiert eine Pokémon-ID auf mindestens drei Stellen und setzt ein # davor. | EN: Formats a Pokémon ID to at least three digits and adds # in front. */
function formatPokemonId(id) {
  let number = String(id);
  while (number.length < 3) number = "0" + number;
  return "#" + number;
}

/** DE: Schreibt den ersten Buchstaben eines Pokémon-Begriffs groß. | EN: Capitalizes the first letter of a Pokémon-related word. */
function capitalizePokemonWord(word) {
  let result = word.charAt(0).toUpperCase();
  for (let i = 1; i < word.length; i++) {
    result += word.charAt(i);
  }
  return result;
}


/** DE: Erstellt einen Typ-Chip für den Profilbereich der Detailansicht. | EN: Creates a type chip for the Profile section in the detail view. */
function getDetailTypeTemplate(type) {
  const name = capitalizePokemonWord(type);
  return `<span class="detail-type-chip type-${type}">${name}</span>`;
}

/** DE: Erstellt einen Ability-Chip für den Profilbereich der Detailansicht. | EN: Creates an ability chip for the Profile section in the detail view. */
function getDetailAbilityTemplate(ability) {
  const name = capitalizePokemonWord(ability);
  return `<span class="detail-ability-chip">${name}</span>`;
}
