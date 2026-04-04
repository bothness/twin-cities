<script>
  import { createEventDispatcher } from "svelte";
  import accessibleAutocomplete from "accessible-autocomplete";

  const dispatch = createEventDispatcher();
  const sleep = (ms = 1000) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  const chevron = (opts) =>
    `<svg class="${opts?.className}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 11.75 7.7" width="18" style="z-index:1"><path fill="currentColor" d="m1.37.15 4.5 5.1 4.5-5.1a.37.37 0 0 1 .6 0l.7.7a.45.45 0 0 1 0 .5l-5.5 6.2a.37.37 0 0 1-.6 0l-5.5-6.1a.64.64 0 0 1 0-.6l.7-.7a.64.64 0 0 1 .6 0Z"></path></svg>`;

  let inputElement;
  let hideMenu = false;

  export let value = null;
  export let options = [];
  export let id = "autocomplete";
  export let label = "Find a city";
  export let hideLabel = true;
  export let mode = "search";
  export let clearable = true;
  export let autoClear = true;
  export let placeholder = "Find a city";
  // export let idKey = "id";
  export let labelKey = "name";
  export let groupKey = "id";
  export let loadOptions = (query, populateResults) => {
    const filteredResults = options.filter((opt) =>
      opt[labelKey].match(
        new RegExp(`\\b${query.replace(/[^\w\s]/gi, "")}`, "i"),
      ),
    );
    populateResults(filteredResults);
  };

  function inputValueTemplate(result) {
    return result && result[labelKey];
  }

  function suggestionTemplate(result) {
    return (
      result &&
      (groupKey
        ? `${result[labelKey]} <span class="muted-text">${result[groupKey]}</span>`
        : result[labelKey])
    );
  }

  function select(option) {
    value = option;
    dispatch("change", value);
    if (value && autoClear) clearInput();
  }

  function inputChange(e) {
    if (!e.target.value) select(null);
  }

  async function clearInput() {
    hideMenu = true;
    await sleep(0);
    inputElement.value = "";
    await sleep(100);
    inputElement.focus();
    await sleep(0);
    inputElement.blur();
    hideMenu = false;
  }

  function initAutocomplete(element, params) {
    accessibleAutocomplete({
      element,
      id,
      name: `${id}-input`,
      source: loadOptions,
      autoselect: mode === "search",
      onConfirm: select,
      confirmOnBlur: false,
      placeholder,
      displayMenu: "overlay",
      showAllValues: mode === "default",
      dropdownArrow: chevron,
      minLength: mode === "search" ? 3 : 0,
      templates: {
        inputValue: inputValueTemplate,
        suggestion: suggestionTemplate,
      },
    });
    inputElement = document.getElementById(id);
    inputElement.addEventListener("blur", inputChange);
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://alphagov.github.io/accessible-autocomplete/dist/accessible-autocomplete.min.css"
  />
</svelte:head>

{#if label}<label for={id} style:display={hideLabel ? "none" : null}
    >{label}</label
  >{/if}
<div class="ons-autocomplete-wrapper">
  <div
    id="{id}-container"
    class="ons-autocomplete"
    class:hide-menu={hideMenu}
    use:initAutocomplete
  ></div>
  {#if clearable && !autoClear && value}
    <button
      title="Clear selection"
      aria-label="Clear selection"
      on:click={clearInput}
      class="ons-autocomplete-clear"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        viewBox="0 0 14 14"
        width="18"
      >
        <path
          fill="currentColor"
          d="M13.6 1 l -0.71 -0.71 a 0.5 0.5 0 0 0 -0.71 0 l -5.25 5.25 l -5.25 -5.25 a 0.51 0.51 0 0 0 -0.71 0 l -0.71 0.71 a 0.5 0.5 0 0 0 0 0.71 l 5.25 5.25 l -5.25 5.25 a 0.5 0.5 0 0 0 0 0.71 l 0.71 0.71 a 0.5 0.5 0 0 0 0.71 0 l 5.25 -5.25 l 5.25 5.25 a 0.5 0.5 0 0 0 0.71 0 l 0.71 -0.71 a 0.5 0.5 0 0 0 0 -0.71 l -5.25 -5.25 l 5.25 -5.25 a 0.5 0.5 0 0 0 0 -0.71Z"
        />
      </svg>
    </button>
  {/if}
</div>

<style>
  .ons-autocomplete-wrapper {
    position: relative;
    display: inline-block;
  }
  .ons-autocomplete-clear {
    position: absolute;
    display: flex;
    align-items: center;
    align-content: center;
    z-index: 1;
    right: 3px;
    top: calc(50% - 14px);
    height: 28px;
    width: 28px;
    border: none;
    background: white;
  }
  .ons-autocomplete-clear:focus {
    outline: 3px solid #fbc900 !important;
  }
  .hide-menu :global(.autocomplete__menu) {
    display: none;
  }
  .ons-autocomplete :global(.autocomplete__input) {
    border-radius: 4px !important;
    border-width: 1px !important;
    background: white;
  }
  .ons-autocomplete :global(.autocomplete__input--focused) {
    box-shadow: inset 0 0 0 1px black !important;
    outline-color: #fbc900 !important;
  }
  .ons-autocomplete :global(.autocomplete__dropdown-arrow-down) {
    width: 18px !important;
    transform: translateY(-2px);
  }
  .ons-autocomplete :global(.muted-text) {
    opacity: 0.8;
    font-size: smaller;
  }
</style>
