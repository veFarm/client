<script lang="ts">
  import Trend from "@/assets/Trend.svelte";

  export let value: string;
</script>

<table class="w-full text-sm font-medium" data-cy="year-increase">
  <tbody>
    <tr>
      <td class="title flex items-center">
        <div class="bg-zinc-900 rounded inline-block mr-2">
          <Trend class="text-accent h-4" />
        </div>
        Estimated annual gains:
      </td>
      <td class="value">
        {value}&nbsp;&nbsp;VET
      </td>
    </tr>
  </tbody>
</table>

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
  tr > td {
    @apply pb-2;
  }
</style>
