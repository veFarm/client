<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import Swap1 from "@/assets/Swap1.svelte";
  import { TradeForecastItem } from ".";

  let isOpen: boolean = false;

  function handleOpen() {
    isOpen = true
  }
  function handleClose() {
    isOpen = false
  }

  $: {
    console.log({isOpen})
  }
</script>

<Meta title="components/TradeForecastItem" component={TradeForecastItem} />

<Template let:args>
  <div class="p-4 max-w-lg mx-auto bg-highlight">
    <TradeForecastItem {...args} isOpen={isOpen} on:open={handleOpen} on:close={handleClose}>
      <svelte:fragment slot="icon">
        <Swap1 class="inline-block" />
      </svelte:fragment>
    </TradeForecastItem>
  </div>
</Template>

<Story
  name="Default"
  args={{
    label: "next trade",
    timeLeft: "3 Days",
    vthoSpent: "125",
    vetEarned: "1.2",
    totalFees: "4.05",
  }}
/>
