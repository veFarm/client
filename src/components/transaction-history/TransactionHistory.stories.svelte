<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { TransactionHistory } from ".";
</script>

<Meta title="components/TransactionHistory" component={TransactionHistory} />

<Template let:args>
  <div class="bg-background p-4">
    <TransactionHistory {...args} />
  </div>
</Template>

<!-- TODO: mock fetch request -->
<Story name="Default" args={{}} />
