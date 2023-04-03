<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { clickOutsideDialog } from "@/actions/click-outside-dialog";
  import CloseIcon from "@/assets/Close.svelte";
  import { Divider } from "@/components/divider";

  export let isOpen = false;

  let dialog: HTMLDialogElement;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch("close");
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") hide();
  }

  function show() {
    isOpen = true;
    document.body.style.overflow = "hidden";
    dialog.show(); // use the show method of the HTMLDialogElement interface
  }

  function hide() {
    isOpen = false;
    document.body.style.overflow = "";
    dialog.close(); // use the close method of the <dialog> element
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
    bind:this={dialog}
    use:clickOutsideDialog
    on:keydown={handleKeyDown}
    on:outclick={hide}
    on:cancel={hide}
  >
    <!-- Header -->
    <div class="flex items-center px-6 py-4">
      <h3 class="flex-1 text-center ml-6">
        <slot name="header" />
      </h3>

      <button
        class="hover:bg-secondary-100 rounded-full p-1"
        on:click={handleClose}
      >
        <CloseIcon class="w-6 h-6 text-body" />
      </button>
    </div>

    <Divider />

    <!-- Body -->
    <div class="px-6 py-4">
      <slot name="body" />
    </div>
  </dialog>
{/if}

<!-- <script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { clickOutsideDialog } from "@/actions/click-outside-dialog";
  import CloseIcon from "@/assets/Close.svelte";
  import { Divider } from "@/components/divider";

  export let isOpen = false;

  let dialog: HTMLDialogElement;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch("close");
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") handleClose();
  }

  $: {
    if (dialog != null) {
      if (isOpen) {
        dialog.showModal();
      } else {
        dialog.close();
      }
    }
  }
</script>

<dialog
  bind:this={dialog}
  use:clickOutsideDialog
  on:keydown={handleKeyDown}
  on:outclick={handleClose}
>
  <!-- Header --/>
  <div class="flex items-center px-6 py-4">
    <h3 class="flex-1 text-center ml-6">
      <slot name="header" />
    </h3>

    <button
      class="hover:bg-secondary-100 rounded-full p-1"
      on:click={handleClose}
    >
      <CloseIcon class="w-6 h-6 text-body" />
    </button>
  </div>

  <Divider />

  <!-- Body --/>
  <div class="px-6 py-4">
    <slot name="body" />
  </div>
</dialog> -->
<style>
  .backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 9998;
  }

  dialog {
    position: fixed;
    top: 50%;
    transform: translate(0%, -50%);
    z-index: 9999;
  }
</style>
