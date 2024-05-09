<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { fade } from "svelte/transition";
  import { PastTrade } from ".";

  let items: string[] = ["1"];

  function pushItem() {
    items = [...items, items.length.toString()];
  }
</script>

<Meta title="components/PastTrade" component={PastTrade} />

<Template let:args>
  <div class="bg-highlight p-4">
    {#each items as item}
      <div in:fade>
        <PastTrade {...args} />
      </div>
    {/each}

    <button on:click={pushItem}>Push Item</button>
  </div>
</Template>

<Story
  name="Default"
  args={{
    withdrawAmount: "490",
    amountOutReceived: "23.45",
    txId: "0x123",
    blockTimestamp: 1691481210,
    explorerUrl: "https://some.url",
  }}
/>
