<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import Sync2 from "@/assets/Sync2.svg";
  import { Button } from ".";
</script>

<Meta title="components/Button" component={Button} />

<Template let:args>
  <Button {...args}>CONNECT WALLET</Button>
</Template>

<Story
  name="Primary"
  args={{
    intent: "primary",
  }}
/>

<Story name="Secondary" args={{}} />

<Story
  name="Danger"
  args={{
    intent: "danger",
  }}
/>

<Story
  name="Small"
  args={{
    size: "small",
  }}
/>

<Story
  name="FullWidth"
  args={{
    intent: "primary",
    fullWidth: true,
  }}
/>

<Story
  name="Disabled"
  args={{
    disabled: true,
  }}
/>

<Story
  name="PrimaryDisabled"
  args={{
    intent: "primary",
    disabled: true,
  }}
/>

<Story
  name="DangerDisabled"
  args={{
    intent: "danger",
    disabled: true,
  }}
/>

<Story
  name="Loading"
  args={{
    intent: "primary",
    disabled: true,
    loading: true,
  }}
/>

<Story name="Large">
  <Button intent="secondary" size="large">
    <img src={Sync2} class="inline h-7 mr-2 align-top" /> Sync2
  </Button>
</Story>
