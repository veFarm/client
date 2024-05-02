<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Close from "@/assets/Close.svelte";
  import { Divider } from "@/components/divider";

  export let isOpen = false;

  let dialog: HTMLDialogElement & {
    "data-cy"?: string;
  };

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
  <dialog
    class="w-full max-w-sm"
    bind:this={dialog}
    on:keydown={handleKeyDown}
    on:cancel={hide}
    {...$$restProps}
  >
    <!-- Header -->
    <div class="flex items-end justify-between px-6 py-4">
      <h3 class="text-body flex-1">
        <slot name="header" />
      </h3>

      <button class="hover:bg-transparent/20 rounded-full p-1" on:click={hide}>
        <Close class="w-6 h-6 text-body" data-cy="close-modal-button" />
      </button>
    </div>

    <Divider />

    <!-- Body -->
    <div class="px-6 py-4">
      <slot name="body" />
    </div>
  </dialog>
{/if}
