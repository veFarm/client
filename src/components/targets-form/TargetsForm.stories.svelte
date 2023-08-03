<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { TargetsForm } from ".";
</script>

<Meta title="components/TargetsForm" component={TargetsForm} />

<Story name="Default">
  <div class="bg-body p-4 max-w-lg mx-auto">
    <TargetsForm />
  </div>
</Story>
