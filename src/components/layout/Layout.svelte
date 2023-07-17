<script lang="ts">
  import "@/styles/app.css";
  import { Header } from "@/components/header";
  import { WalletModal } from "@/components/wallet-modal";
</script>

<Header />

<main class="px-2 my-8 md:px-4 md:my-16">
  <slot />

  <WalletModal />
</main>

<style>
  main {
    padding-top: var(--header-height);
  }
</style>
