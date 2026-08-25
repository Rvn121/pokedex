"use strict";

function getPokemonCardTemplate(pokemon) {
  return `
    <li class="col">
      ${getPokemonCardButtonTemplate(pokemon)}
    </li>
  `;
}

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

function getPokemonCardHeaderTemplate(pokemon) {
  return `
    <div class="pokemon-card-head">
      <span class="pokemon-id">${formatPokemonId(pokemon.id)}</span>
      <h2 class="pokemon-name">${capitalizePokemonWord(pokemon.name)}</h2>
    </div>
  `;
}

function getPokemonCardBodyTemplate(pokemon) {
  return `
    <div class="pokemon-card-body">
      <div class="pokemon-types">${getPokemonTypesTemplate(pokemon.types)}</div>
      ${getPokemonCardImageTemplate(pokemon)}
    </div>
  `;
}

function getPokemonCardImageTemplate(pokemon) {
  return `
    <img class="pokemon-image" data-id="card-image"
      src="${pokemon.images.official}" alt="${pokemon.name}"
      loading="lazy" />
  `;
}

function getPokemonTypesTemplate(types) {
  return types.map(getPokemonTypeTemplate).join("");
}

function getPokemonTypeTemplate(type) {
  const name = capitalizePokemonWord(type);
  return `<span class="pokemon-type type-${type}">${name}</span>`;
}


function getMoveTemplate(move) {
  return `<span class="detail-move">${capitalizePokemonWord(move)}</span>`;
}

function getEvolutionTemplate(item, currentId) {
  const activeClass = item.id === currentId ? " active" : "";
  return `
    <button class="evolution-chain-item${activeClass}" type="button"
      data-evolution-id="${item.id}" aria-label="Show ${item.name}">
      ${capitalizePokemonWord(item.name)}
    </button>
  `;
}

function getNotFoundTemplate() {
  return `<p data-id="not-found">No match found.</p>`;
}

function formatPokemonId(id) {
  return `#${String(id).padStart(3, "0")}`;
}

function capitalizePokemonWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}


function getDetailTypeTemplate(type) {
  const name = capitalizePokemonWord(type);
  return `<span class="detail-type-chip type-${type}">${name}</span>`;
}

function getDetailAbilityTemplate(ability) {
  const name = capitalizePokemonWord(ability);
  return `<span class="detail-ability-chip">${name}</span>`;
}
