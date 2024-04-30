<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type $$Props = HTMLInputAttributes & {
    id: string;
    label?: string;
    value: any;
    currency?: string;
    hint?: string;
    error?: string;
    subtext?: string;
    "data-cy"?: string;
  };

  export let id: string;
  export let label = "";
  export let value: any;
  export let currency = "";
  export let hint = "";
  export let error = "";
  export let subtext = "";

  let hasError = false;

  $: hasError = error != null && error.length > 0;
</script>

<label
  for={id}
  class="{hasError
    ? 'text-danger'
    : 'text-white'} text-sm font-medium space-y-2"
>
  {label}
  <div class="relative">
    <input
      {id}
      class="h-12 sm:h-14 bg-transparent border {hasError
        ? 'border-danger'
        : 'border-color'} text-white text-xl font-bold rounded-lg focus:ring-primary focus:border-primary block w-full p-2 pr-1 sm:pr-2 pl-4 disabled:text-disabled"
      {...$$restProps}
      bind:value
      on:input
    />
    {#if currency.length > 0}
      <div
        class="absolute top-4 right-3 sm:right-6 text-sm sm:text-base font-bold text-white px-1.5"
        class:text-disabled={$$restProps.disabled}
        data-cy="currency"
      >
        {currency}
      </div>
    {/if}
    <!-- {#if subtext.length > 0}
      <div
        class="absolute bottom-1 right-2 text-sm text-accent px-1.5"
        data-cy="subtext"
      >
        {subtext}
      </div>
    {/if} -->
  </div>
  {#if hint.length > 0 && !hasError}
    <legend class="text-xs text-accent">{hint}</legend>
  {/if}
  {#if hasError}
    <legend>{error}</legend>
  {/if}
</label>

<style>
  .border-color {
    border-color: rgba(91, 91, 91, 1);
  }
  .text-disabled {
    color: rgba(144, 144, 144, 1);
  }
</style>
