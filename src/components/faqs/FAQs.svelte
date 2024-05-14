<script lang="ts">
  import { Accordion } from "@/components/accordion";
</script>

<Accordion title="What are VET and VTHO?">
  <svelte:fragment slot="body">
    VeChain operates on a 2-token model consisting of VET and VTHO. While VET
    functions as a store of value, VTHO is the currency used to pay for
    transaction fees on the VeChain network. Notably, VTHO is generated
    passively by holding VET, with each VET generating .000432 VTHO per day.
  </svelte:fragment>
</Accordion>

<Accordion title="How does Vearn work?">
  <svelte:fragment slot="body">
    Vearn takes advantage of this model by automatically converting VTHO tokens,
    generated from VET holdings, into additional VET tokens through
    decentralized exchanges (DEX). By automating this process, Vearn enables
    users to continuously increase their VET holdings over time, capitalizing on
    the perpetual generation of VTHO within the ecosystem.
  </svelte:fragment>
</Accordion>

<Accordion title="What is the Reserve Balance and why we need it?">
  <svelte:fragment slot="body">
    The Reserve Balance is the minimum amount of VTHO tokens that you would like
    to keep in your account at all times and prevent Vearn to spend it. VTHO is
    the currency used to pay for transaction fees, so it's always a good idea to
    leave a small reserve to pay for some daily tasks.
  </svelte:fragment>
</Accordion>

<Accordion title="Are my VET tokens at risk?">
  <svelte:fragment slot="body">
    No. Vearn doesn't have access to your VET tokens. Vearn requests permission
    to spend your VTHO token in exchange for VET. As with any decentralize
    application there exist risk at the smart contract level but these risks
    could never affect your VET tokens.
  </svelte:fragment>
</Accordion>

<Accordion title="Is the project open source?">
  <svelte:fragment slot="body">
    Most of the code is open source. We believe open source is the only way to
    work in a blockchain environment.
  </svelte:fragment>
</Accordion>

<Accordion title="Is the Vearn smart contract upgradable?">
  <svelte:fragment slot="body">
    No. Once deployed, the smart contract cannot be altered to modify its logic.
    The only way to upgrade it is to deploy a new contract and ask all the users
    to migrate to the new contract.
  </svelte:fragment>
</Accordion>

<Accordion title="What is the address of the Vearn contract?">
  <svelte:fragment slot="body">0x000...</svelte:fragment>
</Accordion>
