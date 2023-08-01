<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { ConnectWalletButton } from ".";
</script>

<Meta title="components/ConnectWalletButton" component={ConnectWalletButton} />

<Story name="Default">
    <ConnectWalletButton intent="primary" />
</Story>
