<script lang="ts">
  import "@/styles/app.css";
  import { Header } from "@/components/header";
  import { WalletModal } from "@/components/wallet-modal";
  import { TransactionHistoryModal } from "@/components/transaction-history-modal";
</script>

<Header />

<main
  class="px-2 my-8 md:px-16 md:my-16 md:border-x border-highlight min-h-screen"
>
  <slot />

  <WalletModal />
  <TransactionHistoryModal />
</main>

<style>
  main {
    padding-top: var(--header-height);
    margin-bottom: -1 * var(--header-height);
  }
</style>
