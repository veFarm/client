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
  class="border border-muted rounded px-2 lg:px-4 py-2 lg:py-3 space-y-2"
  class:bg-highlight={isOpen}
>
  <button on:click={toggle} class="w-full">
    <div class="flex items-center justify-between space-x-2">
      <h4 class={`${isOpen ? "text-accent" : "text-body"} text-base text-left`}>
        {title}
      </h4>
      {#if isOpen}
        <ChevronUp class="flex-shrink-0" />
      {:else}
        <ChevronDown class="flex-shrink-0" />
      {/if}
    </div>
  </button>

  {#if isOpen}
    <div transition:slide class="text-base text-left font-normal">
      <slot name="body" />
    </div>
  {/if}
</div>
