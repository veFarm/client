<script lang="ts">
  import { Meta, Story, Template } from "@storybook/addon-svelte-csf";
  import { Modal } from ".";

  let isOpen = false;

  function handleClick() {
    isOpen = !isOpen;
  }
</script>

<Meta title="components/Modal" component={Modal} />

<Template let:args>
  <button class="text-black" on:click={handleClick}
    >{isOpen ? "Close modal" : "Open modal"}</button
  >
  <Modal {isOpen} {...args}>
    <svelte:fragment slot="header">I&apos;m the header</svelte:fragment>
    <svelte:fragment slot="body">I&apos;m the body</svelte:fragment>
  </Modal>
</Template>

<Story name="Default" args={{}} />
