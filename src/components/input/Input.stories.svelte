<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Input } from ".";
</script>

<Meta title="components/Input" component={Input} />

<Template let:args>
  <div class="bg-highlight p-2">
    <Input id="test" label="Reserve balance" value="18" {...args} />
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
  name="Balance"
  args={{
    balance: "123.45 VTHO",
  }}
/>

<Story
  name="Hint"
  args={{
    hint: "The lowest amount you want to keep in your account at all times. Anything above that amount will be swapped overtime.",
  }}
/>

<Story
  name="Disabled"
  args={{
    disabled: true,
  }}
/>

<Story
  name="DisabledWithCurrency"
  args={{
    disabled: true,
    currency: "VTHO",
  }}
/>

<Story name="Editable">
  <div class="p-2">
    <Input id="test" label="Reserve balance" value="18" balance="123.45 VTHO">
      <svelte:fragment slot="input-right">
        <button>Edit</button>
      </svelte:fragment>
    </Input>
  </div>
</Story>
