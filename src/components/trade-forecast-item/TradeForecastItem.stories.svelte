<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import Swap1 from "@/assets/Swap1.svelte";
  import { TradeForecastItem } from ".";
</script>

<Meta title="components/TradeForecastItem" component={TradeForecastItem} />

<Template let:args>
  <div class="p-4 max-w-lg mx-auto bg-background">
    <TradeForecastItem {...args}>
      <svelte:fragment slot="icon">
        <Swap1 class="inline-block" />
      </svelte:fragment>
    </TradeForecastItem>
  </div>
</Template>

<Story
  name="Default"
  args={{
    timeLeft: "3 Days",
    vthoSpent: "125",
    vetEarned: "1.2",
    totalFees: "4.05",
  }}
/>
