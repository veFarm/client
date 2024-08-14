<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import Close from "@/assets/Close.svelte";

  type Variant = "success" | "info" | "warning";

  export let variant: Variant;
  export let title: string;
  export let closable: boolean = false;

  const dispatch = createEventDispatcher();

  function handleClose() {
    dispatch("close");
  }

  const mapBg: Record<Variant, string> = {
    success: "bg-success",
    info: "bg-info",
    warning: "bg-warning",
  };
  const mapBorder: Record<Variant, string> = {
    success: "border-success",
    info: "border-info",
    warning: "border-warning",
  };
  const mapText: Record<Variant, string> = {
    success: "text-success",
    info: "text-info",
    warning: "text-warning",
  };

  const bg = mapBg[variant];
  const border = mapBorder[variant];
  const text = mapText[variant];
</script>

<div
  class={`${bg} bg-opacity-10 p-3 sm:px-5 sm:py-4 rounded-lg ${text} text-sm font-normal border ${border}`}
  {...$$restProps}
>
  <div class="flex items-center justify-between">
    <h4 class={`text-base font-bold ${text} mb-2`}>{title}</h4>
    {#if closable}
      <button on:click={handleClose} class="-mt-2"><Close /></button>
    {/if}
  </div>
  <p class="text-sm font-normal text-accent">
    <slot name="body" />
  </p>
</div>
