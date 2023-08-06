<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Input } from ".";
</script>

<Meta title="components/Input" component={Input} />

<Template let:args>
  <div class="bg-body p-2">
    <Input id="test" label="I'm the label" value="Some value" {...args} />
  </div>
</Template>

<Story name="Default" args={{}} />

<Story
  name="Error"
  args={{
    error: "I'm the error message",
  }}
/>

<Story
  name="Currency"
  args={{
    currency: "VTHO",
  }}
/>

<Story
  name="Subtext"
  args={{
    subtext: "Balance: 123.45",
  }}
/>

<Story
  name="Hint"
  args={{
    hint: "This is a hint",
  }}
/>
