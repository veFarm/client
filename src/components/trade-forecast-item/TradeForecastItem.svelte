<script lang="ts">
  import ChevronDown from "@/assets/ChevronDown.svelte";
  import ChevronUp from "@/assets/ChevronUp.svelte";

  export let timeLeft: string;
  export let vthoSpent: string;
  export let vetEarned: string;
  export let totalFees: string;

  let isOpen: boolean = true;

  function toggle() {
    isOpen = !isOpen;
  }
</script>

<div class:is-open={isOpen}>
  <table
    class="w-full text-xs sm:text-sm font-medium"
    data-cy="trades-forecast-table"
  >
    <tbody>
      <tr class="cursor-pointer" on:click={toggle}>
        <td class="title"><div class="bg-zinc-900 rounded inline-block mr-1"><slot name="icon" /></div> Time until the next trade:</td>
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
    <div class="border-style">
      <table
        class="w-full text-xs sm:text-sm font-medium"
        data-cy="trades-forecast-table"
      >
        <tbody>
          <tr>
            <td class="title">VTHO to be spent:</td>
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
    @apply w-0 whitespace-nowrap text-accent;
  }
  .value {
    @apply w-1/2 truncate text-right text-body;
    max-width: 1px;
  }
  .border-style {
    @apply border-l-2 border-highlight mx-3 pl-3;
  }
  .is-open {
    @apply bg-black -mx-2 p-2;
    /* @apply -mt-2; */
  }
  tr > td {
    @apply pb-2;
  }
</style>
