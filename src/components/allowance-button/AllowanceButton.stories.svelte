<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { AllowanceButton } from ".";
</script>

<Meta title="components/AllowanceButton" component={AllowanceButton} />

<Story name="Default">
  <div class="bg-body p-4 max-w-lg mx-auto">
    <AllowanceButton />
  </div>
</Story>
