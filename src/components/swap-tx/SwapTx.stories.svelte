<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { SwapTx } from ".";
</script>

<Meta title="components/SwapTx" component={SwapTx} />

<Template let:args>
  <div class="bg-background p-4">
    <SwapTx {...args} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    amountIn: "490",
    amountOut: "23.45",
    txId: "0x123",
    explorerUrl: "https://some.url",
  }}
/>
