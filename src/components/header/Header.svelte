<script lang="ts">
  import { Popover } from "svelte-smooth-popover";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { shortenAddress } from "@/utils/shorten-address";
  import { formatUnits } from "@/utils/format-units";
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
    border-b md:border-x border-highlight
    px-2 sm:px-4 py-2
    flex flex-wrap items-center justify-between
    text-sm text-gray-300 md:text-base
  "
  data-cy="navigation-bar"
>
  <a href="/">
    <!-- <img src={SvelteLogo} width="32" height="32" alt="Svelte logo" /> -->
    vearn
  </a>

  {#if $wallet.connected && $balance.current != null}
    <div>
      {formatUnits($balance.current.vet, 2)}&nbsp;VET&nbsp;

      <button class="inline-block" data-cy="open-dropdown-button">
        {shortenAddress($wallet.account)}
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
