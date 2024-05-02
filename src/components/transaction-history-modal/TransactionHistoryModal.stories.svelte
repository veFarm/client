<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { TransactionHistoryModal } from ".";
</script>

<Meta
  title="components/TransactionHistoryModal"
  component={TransactionHistoryModal}
/>

<Template let:args>
  <div class="bg-background p-4">
    <TransactionHistoryModal {...args} />
  </div>
</Template>

<!-- TODO: mock fetch request -->
<Story name="Default" args={{}} />
