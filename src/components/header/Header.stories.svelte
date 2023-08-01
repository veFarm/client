<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Header } from ".";
</script>

<Meta title="components/Header" component={Header} />

<Story name="Default">
  <Header />
</Story>

<!-- TODO: add a story for a logged in account, ie, mock $wallet storage -->
