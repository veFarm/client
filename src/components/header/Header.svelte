<script lang="ts">
  import { Popover } from "svelte-smooth-popover";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { shortenAddress } from "@/utils/shorten-address";
  import { formatUnits } from "@/utils/format-units";
  import LogoDesktop from "@/assets/LogoDesktop.svelte";
  import ChevronDown from "@/assets/ChevronDown.svelte";

  /** Popover state. */
  let isOpen = false;

  function handleDisconnect() {
    wallet.disconnect();
    isOpen = false;
  }
</script>

<nav
  class="
    fixed top-0 w-full mx-auto h-16 z-20
    bg-black border-b md:border-x border-highlight
    flex flex-wrap items-center justify-between
    text-sm text-gray-300 md:text-base
  "
  data-cy="navigation-bar"
>
  <div class="p-2 sm:px-6 sm:py-3">
    <LogoDesktop alt="Vearn Finance" />
  </div>

  {#if $wallet.connected && $balance.current != null}
    <div class="flex items-center justify-between p-2 sm:px-6 sm:py-3 border-l border-muted h-full w-80">
      <div>
        <p class="text-xs font-medium">{shortenAddress($wallet.account)}</p>
        <p class="text-sm font-bold">{formatUnits($balance.current.vet, 2)}&nbsp;VET&nbsp;</p>
      </div>

      <button
        class="text-sm font-medium"
        on:click={handleDisconnect}
        data-cy="disconnect-wallet-button"
      >
        Disconnect
      </button>
      <!-- <button class="inline-block" data-cy="open-dropdown-button">
        <ChevronDown class="inline-block text-inherit" />

        <Popover
          showOnClick
          hideOnExternalClick
          caretWidth={0}
          align="bottom-left"
          on:open={() => {
            isOpen = true;
          }}
          on:close={() => {
            isOpen = false;
          }}
        >
          <div class="bg-highlight border border-muted rounded-md px-4 py-3">
            <button
              class="text-sm md:text-base"
              on:click={handleDisconnect}
              data-cy="disconnect-wallet-button"
            >
              Disconnect Wallet
            </button>
          </div>
        </Popover>
      </button> -->
    </div>
  {/if}
</nav>

<style>
  nav {
    height: var(--header-height);
    max-width: var(--app-width);
  }
</style>
