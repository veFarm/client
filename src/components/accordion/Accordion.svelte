<script lang="ts">
  import { slide } from "svelte/transition";
  import ChevronDown from "@/assets/ChevronDown.svelte";
  import ChevronUp from "@/assets/ChevronUp.svelte";

  export let title: string;

  let isOpen: boolean = false;

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div
  class="border border-muted rounded px-4 py-2 text-accent space-y-2"
>
  <button on:click={toggle} class="w-full">
    <div class="flex items-center justify-between">
      <h4 class="text-base text-accent">{title}</h4>
      {#if isOpen}
        <ChevronUp />
      {:else}
        <ChevronDown />
      {/if}
    </div>
  </button>

  {#if isOpen}
    <div transition:slide class="text-sm">
      <slot name="body" />
    </div>
  {/if}
</div>
