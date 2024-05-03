<script lang="ts">
  import { Popover } from "svelte-smooth-popover";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { shortenAddress } from "@/utils/shorten-address";
  import { formatUnits } from "@/utils/format-units";
  import Logo from "@/assets/Logo.svelte";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
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
  "
  data-cy="navigation-bar"
>
  <div class="pl-2 pr-4 sm:px-6 sm:py-3">
    <Logo alt="Vearn Finance" />
  </div>

    <div
      class="flex items-center justify-between pl-4 pr-2 sm:px-6 sm:py-3 border-l space-x-8 border-highlight h-full min-w-min sm:w-80"
    >
  {#if $wallet.connected && $balance.current != null}
      <div>
        <p class="text-xs font-medium">{shortenAddress($wallet.account)}</p>
        <p class="text-sm font-bold">
          {formatUnits($balance.current.vet, 2)}&nbsp;VET&nbsp;
        </p>
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
  {:else}
      <ConnectWalletButton variant="icon" class="ml-auto sm:ml-0" />
  {/if}
    </div>
</nav>

<style>
  nav {
    height: var(--header-height);
    max-width: var(--app-width);
  }
</style>
