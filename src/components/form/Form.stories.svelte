<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Form } from ".";
</script>

<Meta title="components/Form" component={Form} />

<Story name="Default">
  <div class="bg-body p-4 max-w-lg mx-auto">
    <Form />
  </div>
</Story>
