<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Stats } from ".";
</script>

<Meta title="components/Stats" component={Stats} />

<Story name="Default">
  <div class="max-w-xl">
    <Stats />
  </div>
</Story>
