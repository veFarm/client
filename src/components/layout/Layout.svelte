<script lang="ts">
  import "@/styles/app.css";
  import { Header } from "@/components/header";
  import { Footer } from "@/components/footer";
  import { WalletModal } from "@/components/wallet-modal";
  import { TransactionHistory } from "@/components/transaction-history";
</script>

<Header />

<div class="flex flex-col min-h-screen md:border-x border-muted">
  <main class="flex-1 px-2 my-8 md:px-16 md:my-16">
    <slot />

    <WalletModal />
    <!-- <TransactionHistory /> -->
  </main>

  <Footer />
</div>

<style>
  main {
    padding-top: var(--header-height);
    /* margin-bottom: -1 * var(--header-height); */
  }
</style>
