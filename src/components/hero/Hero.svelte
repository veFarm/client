<script lang="ts">
  import { StatItem } from "@/components/stat-item";
</script>

<h1>Swap VTHO for VET automatically.</h1>
<p class="text-gray-300 mt-4">
  Select your swap configuration and allow the VeFarm contract to spend your VTHO.
  After which the contract will periodically withdraw VTHO from your account,
  perform a swap for VET tokens through a DEX, and return the resulting tokens
  back to your wallet.
</p>
<!-- <p class="text-gray-400">
  VTHO is a token on VeChain, which is generated automatically when you
  hold VET. Therefore, one way to increase your VET balance is by
  exchanging earned VTHO tokens for VET on a regular basis. By doing so,
  you will generate more VTHO which can then be traded for even more VET,
  and the cycle continues.
</p> -->
<div class="hidden md:grid md:grid-cols-3 md:row-gap-8 md:mt-10 md:mx-auto">
  <StatItem value="3.2K" label="Trades" />
  <StatItem value="13.8K" label="VET volume" />
  <StatItem value="486" label="Accounts" />
</div>
