<script lang="ts">
  import { wallet } from "@/stores/wallet";
  import { shortenAddress } from "@/utils/shorten-address";
  import { formatUnits } from "@/utils/format-units";
</script>

<nav
  class="
    fixed top-0 w-full mx-auto h-16 z-20
    bg-background border-b border-muted
    px-2 sm:px-4 py-2
    flex flex-wrap items-center justify-between
    text-sm md:text-base
  "
>
  <a href="/">
    <!-- <img src={SvelteLogo} width="32" height="32" alt="Svelte logo" /> -->
    VeFarm
  </a>

  {#if $wallet.account == null}
    <!-- <ConnectWalletButton size="small" /> -->
  {:else}
    <span>
      {formatUnits($wallet.balance.vet, 2)}&nbsp;VET{" "}
      {shortenAddress($wallet.account)}
    </span>
  {/if}
</nav>

<style>
  nav {
    height: var(--header-height);
    max-width: var(--app-width);
  }
</style>
