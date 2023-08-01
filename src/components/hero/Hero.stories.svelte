<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Hero } from ".";
</script>

<Meta title="components/Hero" component={Hero} />

<Story name="Default">
  <div class="max-w-xl">
    <Hero />
  </div>
</Story>
