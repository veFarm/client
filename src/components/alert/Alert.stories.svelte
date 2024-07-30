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
    variant: "success",
    title: "Autopilot Enabled",
    body: "Vearn will periodically exchange VTHO for VET while keeping a balance of 15 VTHO in your account.",
  }}
/>

<Story
  name="Info"
  args={{
    variant: "info",
    title: "Autopilot Enabled",
    body: "Vearn will periodically exchange VTHO for VET while keeping a balance of 15 VTHO in your account.",
  }}
/>

<Story
  name="Warning"
  args={{
    variant: "warning",
    title: "Autopilot Enabled",
    body: "Vearn will periodically exchange VTHO for VET while keeping a balance of 15 VTHO in your account.",
  }}
/>

<Story
  name="Closable"
  args={{
    variant: "success",
    title: "Autopilot Enabled",
    body: "Vearn will periodically exchange VTHO for VET while keeping a balance of 15 VTHO in your account.",
    closable: true,
  }}
/>
