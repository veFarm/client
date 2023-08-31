<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { TradesHistory } from ".";
</script>

<Meta title="components/TradesHistory" component={TradesHistory} />

<Template let:args>
  <div class="bg-background p-4">
    <TradesHistory {...args} />
  </div>
</Template>

<!-- TODO: mock fetch request -->
<Story name="Default" args={{}} />
