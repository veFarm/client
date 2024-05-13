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

<Accordion title="Are my VET tokens at risk?">
  <svelte:fragment slot="body">
    No, Vearn requests permission to spend your VTHO token in exchange for VET
    token. As with any decentralize application there exist risk at the smart
    contract level but your VET tokens are never at risk.
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
    No, once deployed, the smart contract cannot be altered to modify its logic.
  </svelte:fragment>
</Accordion>

<Accordion title="What's the address of the Vearn contract?">
  <svelte:fragment slot="body">
    No, once deployed, the smart contract cannot be altered to modify its logic.
  </svelte:fragment>
</Accordion>
