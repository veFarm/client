<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Alert } from ".";
</script>

<Meta title="components/Alert" component={Alert} />

<Template let:args>
  <div>
    <Alert {...args} />
  </div>
</Template>

<Story
  name="Success"
  args={{
    title: "Autopilot Enabled",
    body: "Vearn will periodically exchange VTHO for VET while keeping a balance of 15 VTHO in your account.",
  }}
/>

<Story
  name="Closable"
  args={{
    title: "Autopilot Enabled",
    body: "Vearn will periodically exchange VTHO for VET while keeping a balance of 15 VTHO in your account.",
    closable: true,
  }}
/>
