<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import SwapTx from "./SwapTx.svelte";
</script>

<Meta title="components/SwapTx" component={SwapTx} />

<Template let:args>
  <div class="p2 border border-red-600">
    <SwapTx {...args} />
    <p>{JSON.stringify(args)}</p>
  </div>
</Template>

<div class="p2 border border-red-600">
  <Story
    name="Default"
    args={{
      amountIn: "490",
      amountOut: "23.45",
      txId: "0x123",
      explorerUrl: "https://some.url",
    }}
  />
</div>
