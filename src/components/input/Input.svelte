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
  class="{hasError ? 'text-danger' : 'text-background'} text-sm space-y-1"
>
  {label}
  <div class="relative">
    <input
      {id}
      class="bg-gray-50 border {hasError
        ? 'border-danger'
        : 'border-gray-300'} text-background text-xl font-medium rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-5 pb-7 disabled:bg-gray-200"
      {...$$restProps}
      bind:value
      on:input
    />
    {#if currency.length > 0}
      <div
        class="absolute top-5 right-2 text-lg font-medium bg-gray-200 px-1.5 rounded-sm"
        class:bg-gray-300={$$restProps.disabled}
      >
        {currency}
      </div>
    {/if}
    {#if subtext.length > 0}
      <div class="absolute bottom-1 right-2 text-sm text-accent px-1.5">
        {subtext}
      </div>
    {/if}
  </div>
  {#if hint.length > 0 && !hasError}
    <legend class="text-xs text-accent">{hint}</legend>
  {/if}
  {#if hasError}
    <legend>{error}</legend>
  {/if}
</label>
