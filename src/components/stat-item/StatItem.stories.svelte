<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { StatItem } from ".";
</script>

<Meta title="components/StatItem" component={StatItem} />

<Template let:args>
  <div class="bg-background p-4">
    <StatItem {...args} />
  </div>
</Template>

<Story
  name="Default"
  args={{
    value: 345,
    label: "Users",
  }}
/>
