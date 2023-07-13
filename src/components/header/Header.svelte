<script lang="ts">
  import { wallet } from "@/stores/wallet";
  import { shortenAddress } from "@/utils/shorten-address";
  // import SvelteLogo from "@/assets/Svelte.svg";
  // import { DarkMode } from "@/components/dark-mode";
  // import { ConnectWalletButton } from "@/components/connect-wallet-button";
</script>

<nav
  class="
    fixed top-0 w-full mx-auto h-16 z-20
    bg-background border-b border-muted
    px-2 sm:px-4 py-2
    flex flex-wrap items-center justify-between
  "
>
  <a href="/">
    <!-- <img src={SvelteLogo} width="32" height="32" alt="Svelte logo" /> -->
    VeFarm
  </a>

  <div class="flex items-center space-x-3">
    <!-- <DarkMode /> -->

    {#if $wallet.account == null}
      <!-- <ConnectWalletButton size="small" /> -->
    {:else}
      <span>{shortenAddress($wallet.account)}</span>
    {/if}
  </div>
</nav>

<style>
  nav {
    height: var(--header-height);
    max-width: var(--app-width);
  }
</style>
