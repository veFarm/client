<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type $$Props = HTMLInputAttributes & {
    value: any;
    label?: string;
    id: string;
    error?: string;
  };

  export let value: any;
  export let label = "";
  export let id: string;
  export let error = "";

  let hasError = false;

  $: hasError = error != null && error.length > 0;
</script>

<label for={id} class="text-background text-sm" class:text-danger={hasError}>
  {label}
  <div class="relative">
    <input
      {id}
      class="bg-gray-50 border border-gray-300 text-background text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 disabled:bg-gray-100"
      class:border-danger={hasError}
      {...$$restProps}
      bind:value
      on:input
    />
    <div class="absolute top-2.5 right-2 bg-gray-200 px-1.5 rounded-sm">
      <slot name="sufix" />
    </div>
  </div>
  {#if hasError}
    <legend class="text-danger text-sm mt-1">{error}</legend>
  {/if}
</label>
