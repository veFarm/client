<script lang="ts">
  import { Popover } from "svelte-smooth-popover";
  import { wallet } from "@/stores/wallet";
  import { shortenAddress } from "@/utils/shorten-address";
  import { formatUnits } from "@/utils/format-units";
  import ChevronDown from "@/assets/ChevronDown.svelte";

  /** Popover state. */
  let isOpen = false;

  function handleDisconnect() {
    localStorage.removeItem("user");
    wallet.disconnect();
    isOpen = false;
  }
</script>

<nav
  class="
    fixed top-0 w-full mx-auto h-16 z-20
    bg-background border-b border-muted
    px-2 sm:px-4 py-2
    flex flex-wrap items-center justify-between
    text-sm text-gray-300 md:text-base
  "
>
  <a href="/">
    <!-- <img src={SvelteLogo} width="32" height="32" alt="Svelte logo" /> -->
    VeFarm
  </a>

  {#if $wallet.account == null}
    <!-- <ConnectWalletButton size="small" /> -->
  {:else}
    <div>
      {formatUnits($wallet.balance.vet, 2)}&nbsp;VET&nbsp;

      <button class="inline-block">
        {shortenAddress($wallet.account)}
        <ChevronDown class="inline-block text-inherit" />

        <Popover
          showOnClick
          hideOnExternalClick
          caretWidth={0}
          on:open={() => {
            isOpen = true;
          }}
          on:close={() => {
            isOpen = false;
          }}
        >
          <div class="bg-highlight border border-muted rounded-md px-4 py-3">
            <button class="text-sm md:text-base" on:click={handleDisconnect}
              >Disconnect Wallet</button
            >
          </div>
        </Popover>
      </button>
    </div>
  {/if}
</nav>

<style>
  nav {
    height: var(--header-height);
    max-width: var(--app-width);
  }
</style>
