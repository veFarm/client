<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Close from "@/assets/Close.svelte"

  export let title: string;
  export let body: string;
  export let closable: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch("close");
  }
</script>

<div
  class="bg-success bg-opacity-10 p-3 sm:px-5 sm:py-4 rounded-lg text-success text-sm font-normal border border-success"
  {...$$restProps}
>
  <div class="flex items-center justify-between">
    <h4 class="text-base font-bold text-success mb-2">{title}</h4>
    {#if closable}
      <button on:click={handleClose} class="-mt-2"><Close /></button>
    {/if}
  </div>
  <p class="text-sm font-normal text-body">{body}</p>
</div>
