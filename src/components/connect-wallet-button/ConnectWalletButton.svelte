<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { walletModal } from "@/stores/wallet-modal";
  import { Button } from "@/components/button";
  import Sync2 from "@/assets/Sync2.svg";
  import VeWorld from "@/assets/VeWorld.svg";
  import ArrowRight from "@/assets/ArrowRight.svelte";

  type Variant = "icon" | "text";
  type $$Props = ComponentProps<Button> & {
    variant: Variant;
  };

  export let variant: Variant = "text";

  let disabled: boolean = false;

  $: disabled = $walletModal.isOpen;

  function handleClick() {
    walletModal.open();
  }
</script>

{#if variant === "text"}
  <Button
    {disabled}
    on:click={handleClick}
    data-cy="connect-wallet-button-text"
    {...$$props}
  >
    CONNECT WALLET
  </Button>
{:else}
  <button
    {...$$props}
    class={`flex items-center space-x-3 text-sm font-medium text-accent ${$$props.class}`}
    {disabled}
    on:click={handleClick}
    data-cy="connect-wallet-button-icon"
  >
    <div class="relative mr-7">
      <img src={VeWorld} class="h-6 border border-slate-800 rounded-full" />
      <img src={Sync2} class="absolute h-6 left-3.5 top-0" />
    </div>
    Connect Wallet <ArrowRight />
  </button>
{/if}
