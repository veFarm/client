<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { SwapsHistory } from ".";
</script>

<Meta title="components/SwapsHistory" component={SwapsHistory} />

<Template let:args>
  <div class="bg-background p-4">
    <SwapsHistory {...args} />
  </div>
</Template>

<!-- TODO: mock fetch request -->
<Story name="Default" args={{}} />
