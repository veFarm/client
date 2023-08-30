<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { PastTrade } from ".";
</script>

<Meta title="components/PastTrade" component={PastTrade} />

<Template let:args>
  <div class="bg-background p-4">
    <PastTrade {...args} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    withdrawAmount: "490",
    amountOut: "23.45",
    txId: "0x123",
    blockTimestamp: 1691481210,
    explorerUrl: "https://some.url",
  }}
/>
