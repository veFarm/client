<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import type { WalletId } from "@/typings/types";
  import Sync2Icon from "@/assets/Sync2.svg";
  import VeWorldIcon from "@/assets/VeWorld.svg";
  import { Button } from "@/components/button";

  export let disabled = false;

  const WALLET_PROVIDERS: {
    id: WalletId;
    label: string;
    icon: string;
  }[] = [
    { id: "sync2", label: "Sync2", icon: Sync2Icon },
    { id: "ve_world", label: "VeWorld", icon: VeWorldIcon },
  ];

  const dispatch = createEventDispatcher();

  async function handleConnect(walletId: WalletId) {
    dispatch("connect", { walletId });
  }
</script>

{#each WALLET_PROVIDERS as { id, label, icon }}
  <Button
    fullWidth
    {disabled}
    class="flex items-center justify-center space-x-3"
    on:click={() => {
      handleConnect(id);
    }}
  >
    <img src={icon} class="h-5" alt={`${label} icon`} />

    <span class="text-center">{label}</span>
  </Button>
{/each}
