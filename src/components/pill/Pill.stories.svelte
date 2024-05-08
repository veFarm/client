<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Pill } from ".";
</script>

<Meta title="components/Pill" component={Pill} />

<Template let:args>
  <div>
    <Pill {...args} />
  </div>
</Template>

<Story
  name="Success"
  args={{
    value: "Active",
  }}
/>
