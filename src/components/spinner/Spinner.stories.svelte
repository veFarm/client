<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Spinner } from ".";
</script>

<Meta title="components/Spinner" component={Spinner} />

<Template let:args>
  <div class="bg-white">
    <Spinner {...args} />
  </div>
</Template>

<Story name="Default" />
