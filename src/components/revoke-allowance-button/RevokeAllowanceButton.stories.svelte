<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { RevokeAllowanceButton } from ".";
</script>

<Meta title="components/AllowanceButton" component={RevokeAllowanceButton} />

<Story name="Default">
  <div class="bg-body p-4 max-w-lg mx-auto">
    <RevokeAllowanceButton />
  </div>
</Story>
