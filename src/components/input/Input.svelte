<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import WalletFull from "@/assets/WalletFull.svelte";

  type $$Props = HTMLInputAttributes & {
    id: string;
    label?: string;
    value: any;
    currency?: string;
    balance?: string;
    hint?: string;
    error?: string;
    "data-cy"?: string;
  };

  export let id: string;
  export let label = "";
  export let value: any;
  export let currency = "";
  export let balance = "";
  export let hint = "";
  export let error = "";

  let hasError = false;

  $: hasError = error != null && error.length > 0;
</script>

<label
  for={id}
  class="{hasError ? 'text-danger' : 'text-body'} text-sm font-medium w-full"
>
  {label}
  <div class="h-2" />
  <div class="relative">
    {#if balance != null && balance.length > 0}
      <div
        class="absolute -top-7 right-0 text-xs font-medium text-accent pl-1 flex items-end"
        data-cy="balance"
      >
        <WalletFull class="mr-1" />
        {balance}
      </div>
    {/if}
    <div class="flex">
      <div class="relative w-full">
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
            class="absolute top-2.5 right-3 sm:top-3 sm:right-4 bg-black px-3 py-1 rounded-md text-sm sm:text-base font-bold text-white"
            class:text--disabled={$$restProps.disabled}
            data-cy="currency"
          >
            {currency}
          </div>
        {/if}
      </div>
      <slot name="input-right" />
    </div>
  </div>
  {#if hint.length > 0 && !hasError}
    <legend class="text-xs text-accent mt-2">{hint}</legend>
  {/if}
  {#if hasError}
    <legend>{error}</legend>
  {/if}
</label>

<style lang="postcss">
  .border-color {
    border-color: rgba(91, 91, 91, 1);
  }
  /*
   * For some reason I had to overwrite this.
   * Notice the double dash '--' in the class name.
   */
  .text--disabled {
    @apply text-disabled;
  }
</style>
