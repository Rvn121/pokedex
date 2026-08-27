"use strict";

// Erstellt das äußere Listenelement für eine einzelne Pokémon-Karte.
function getPokemonCardTemplate(pokemon) {
  return `
    <li class="col">
      ${getPokemonCardButtonTemplate(pokemon)}
    </li>
  `;
}

// Erstellt den anklickbaren Button einer Pokémon-Karte inklusive Haupttyp und data-id.
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

// Erstellt den Kopfbereich einer Karte mit Pokémon-ID und Namen.
function getPokemonCardHeaderTemplate(pokemon) {
  return `
    <div class="pokemon-card-head">
      <span class="pokemon-id">${formatPokemonId(pokemon.id)}</span>
      <h2 class="pokemon-name">${capitalizePokemonWord(pokemon.name)}</h2>
    </div>
  `;
}

// Erstellt den unteren Kartenbereich mit Typen und Pokémon-Bild.
function getPokemonCardBodyTemplate(pokemon) {
  return `
    <div class="pokemon-card-body">
      <div class="pokemon-types">${getPokemonTypesTemplate(pokemon.types)}</div>
      ${getPokemonCardImageTemplate(pokemon)}
    </div>
  `;
}

// Erstellt das Bild-Element der kleinen Pokémon-Karte.
function getPokemonCardImageTemplate(pokemon) {
  return `
    <img class="pokemon-image" data-id="card-image"
      src="${pokemon.images.official}" alt="${pokemon.name}"
      loading="lazy" />
  `;
}

// Erstellt aus allen Typen eines Pokémon die komplette Typen-Ausgabe.
function getPokemonTypesTemplate(types) {
  return types.map(getPokemonTypeTemplate).join("");
}

// Erstellt die sichtbare Plakette für einen einzelnen Pokémon-Typ.
function getPokemonTypeTemplate(type) {
  const name = capitalizePokemonWord(type);
  return `<span class="pokemon-type type-${type}">${name}</span>`;
}


// Erstellt eine einzelne sichtbare Attacke für den Moves-Bereich.
function getMoveTemplate(move) {
  return `<span class="detail-move">${capitalizePokemonWord(move)}</span>`;
}

// Erstellt einen anklickbaren Eintrag der Evolutionskette und markiert das aktuelle Pokémon.
function getEvolutionTemplate(item, currentId) {
  const activeClass = item.id === currentId ? " active" : "";
  return `
    <button class="evolution-chain-item${activeClass}" type="button"
      data-evolution-id="${item.id}" aria-label="Show ${item.name}">
      ${capitalizePokemonWord(item.name)}
    </button>
  `;
}

// Erstellt die vorgeschriebene Kein-Treffer-Meldung mit data-id="not-found".
function getNotFoundTemplate() {
  return `<p data-id="not-found">No matching Pokémon found.</p>`;
}

// Formatiert eine Pokémon-ID auf mindestens drei Stellen und setzt ein # davor.
function formatPokemonId(id) {
  let number = String(id);
  while (number.length < 3) number = "0" + number;
  return "#" + number;
}

// Schreibt den ersten Buchstaben eines Pokémon-Begriffs groß.
function capitalizePokemonWord(word) {
  let result = word.charAt(0).toUpperCase();
  for (let i = 1; i < word.length; i++) {
    result += word.charAt(i);
  }
  return result;
}


// Erstellt einen Typ-Chip für den Profilbereich der Detailansicht.
function getDetailTypeTemplate(type) {
  const name = capitalizePokemonWord(type);
  return `<span class="detail-type-chip type-${type}">${name}</span>`;
}

// Erstellt einen Ability-Chip für den Profilbereich der Detailansicht.
function getDetailAbilityTemplate(ability) {
  const name = capitalizePokemonWord(ability);
  return `<span class="detail-ability-chip">${name}</span>`;
}
