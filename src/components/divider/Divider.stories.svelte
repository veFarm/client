<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Divider } from ".";
</script>

<Meta title="components/Divider" component={Divider} />

<Story name="Vertical">
  <div>
    Above
    <Divider />
    Below
  </div>
</Story>
