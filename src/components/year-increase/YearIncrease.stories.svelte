<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { YearIncrease } from ".";
</script>

<Meta title="components/YearIncrease" component={YearIncrease} />

<Template let:args>
  <div class="p-4 max-w-lg mx-auto bg-highlight">
    <YearIncrease {...args} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    value: "85",
  }}
/>
