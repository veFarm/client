<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import CloseIcon from "@/assets/Close.svelte";
  import { Divider } from "@/components/divider";

  export let isOpen = false;

  let dialog: HTMLDialogElement;

  const dispatch = createEventDispatcher();

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") hide();
  }

  function show() {
    isOpen = true;
    document.body.style.overflow = "hidden";
    dialog.show();
  }

  function hide() {
    isOpen = false;
    document.body.style.overflow = "";
    dialog.close();
    dispatch("close");
  }

  $: {
    if (dialog != null) {
      if (isOpen) {
        show();
      } else {
        hide();
      }
    }
  }
</script>

{#if isOpen}
  <div class="backdrop" on:click={hide} />
  <dialog bind:this={dialog} on:keydown={handleKeyDown} on:cancel={hide}>
    <!-- Header -->
    <div class="flex items-end px-6 py-4">
      <h3 class="text-background flex-1 text-center ml-6">
        <slot name="header" />
      </h3>

      <button class="hover:bg-transparent/20 rounded-full p-1" on:click={hide}>
        <CloseIcon class="w-6 h-6 text-background" />
      </button>
    </div>

    <Divider theme="light" />

    <!-- Body -->
    <div class="px-6 py-4">
      <slot name="body" />
    </div>
  </dialog>
{/if}
