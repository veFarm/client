<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Divider } from ".";
</script>

<Meta title="components/Divider" component={Divider} />

<Template let:args>
  <div>
    Above
    <Divider {...args} />
    Below
  </div>
</Template>

<Story name="Dark" args={{}} />

<Story name="Light" args={{ theme: "light" }} />
