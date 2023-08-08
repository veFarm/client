<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Layout } from ".";
</script>

<Meta title="components/Layout" component={Layout} />

<Story name="Vertical">
  <Layout>
    <p>I&apos;m inside the layout</p>
  </Layout>
</Story>
