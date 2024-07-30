<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";
  import ChevronDown from "@/assets/ChevronDown.svelte";
  import ChevronUp from "@/assets/ChevronUp.svelte";
  import Info from "@/assets/Info.svelte";

  export let isOpen: boolean;
  export let label: string;
  export let timeLeft: string;
  export let vthoSpent: string;
  export let vetEarned: string;
  export let totalFees: string;

  const dispatch = createEventDispatcher();

  function toggle() {
    dispatch("toggle");
  }
</script>

<div class:is-open={isOpen}>
  <table class="w-full text-sm font-medium" data-cy="trades-forecast-table">
    <tbody>
      <tr class="cursor-pointer" on:click={toggle}>
        <td class="title">
          <div class="bg-zinc-900 rounded inline-block mr-1">
            <slot name="icon" />
          </div>
          Time until {label}:
        </td>
        <td class="value">
          {timeLeft}
          {#if isOpen}
            <ChevronUp class="inline-block" />
          {:else}
            <ChevronDown class="inline-block" />
          {/if}
        </td>
      </tr>
    </tbody>
  </table>
  {#if isOpen}
    <div transition:slide class="border-style">
      <table class="w-full text-sm" data-cy="trades-forecast-table">
        <tbody>
          <tr>
            <td class="title"
              >VTHO to be spent:
              <!-- <Info class="inline h-4 w-4 text-body" /> -->
            </td>
            <td class="value">{vthoSpent} VTHO</td>
          </tr>
          <tr>
            <td class="title">VET to be earned:</td>
            <td class="value">{vetEarned} VET</td>
          </tr>
          <tr>
            <td class="title">Transaction fees:</td>
            <td class="value">{totalFees} VTHO</td>
          </tr>
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style lang="postcss">
  .title {
    @apply w-0 whitespace-nowrap font-normal;
  }
  .value {
    @apply w-1/2 truncate text-right text-accent;
    max-width: 1px;
  }
  .border-style {
    @apply border-l-2 border-muted ml-2.5 mr-1 pl-3;
  }
  .is-open {
    @apply bg-background -mx-2 p-2;
  }
  tr > td {
    @apply pb-2;
  }
</style>
