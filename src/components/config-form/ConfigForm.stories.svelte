<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { ConfigForm } from ".";
</script>

<Meta title="components/ConfigForm" component={ConfigForm} />

<Story name="Default">
  <div class="bg-body p-4 max-w-lg mx-auto">
    <ConfigForm />
  </div>
</Story>
