<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { WalletProviders } from ".";
</script>

<Meta title="components/WalletProviders" component={WalletProviders} />

<Template let:args>
  <div class="flex flex-col space-y-4">
    <WalletProviders {...args} />
  </div>
</Template>

<Story name="Default" args={{}} />

<Story name="Disabled" args={{ disabled: true }} />
