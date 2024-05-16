<script lang="ts">
  import { chain } from "@/config/index";
  import { Accordion } from "@/components/accordion";
  import NewTab from "@/assets/NewTab.svelte";
</script>

<Accordion
  title="What are VET and VTHO, and how do they function within the VeChain ecosystem?"
>
  <svelte:fragment slot="body">
    VeChain operates on a dual-token model, comprising VET and VTHO. VET serves
    primarily as a store of value, while VTHO is the currency used to pay for
    transaction fees on the VeChain network. Notably, VTHO is generated
    passively by holding VET, with each VET generating .000432 VTHO per day.
  </svelte:fragment>
</Accordion>

<Accordion title="What does Vearn do?">
  <svelte:fragment slot="body">
    Vearn continuously increase your VET balance by automatically converting
    VTHO tokens, generated from VET holdings, into additional VET tokens through
    decentralized exchanges (DEX).
  </svelte:fragment>
</Accordion>

<Accordion title="How does Vearn work?">
  <svelte:fragment slot="body">
    Vearn employs a mathematical model to compute optimized strategies for
    timing the swaps based on factors such as account balance and current market
    conditions. By utilizing this approach, Vearn ensures that the conversion
    process is executed at the most opportune moments, thereby optimizing the
    increment of VET holdings for users.
  </svelte:fragment>
</Accordion>

<Accordion title="What is the Reserve Balance and why is it necessary?">
  <svelte:fragment slot="body">
    The Reserve Balance refers to the minimum amount of VTHO that users choose
    to retain in their accounts. This reserve serves the purpose of ensuring
    that a portion of VTHO remains untouched, preventing Vearn from utilizing
    it. Since VTHO is used to cover transaction fees within the VeChain
    ecosystem, maintaining a Reserve Balance ensures that users always have a
    small amount of VTHO readily available to facilitate daily tasks.
  </svelte:fragment>
</Accordion>

<Accordion title="Are my VET tokens at risk when using Vearn?">
  <svelte:fragment slot="body">
    No, your VET tokens are not at risk when using Vearn. Vearn does not have
    access to your VET tokens. Instead, Vearn requests permission to spend your
    VTHO tokens in exchange for VET. While there may be risks associated with
    decentralized applications, these risks do not extend to your VET tokens.
  </svelte:fragment>
</Accordion>

<Accordion title="Is the Vearn project open source?">
  <svelte:fragment slot="body">
    Yes, the majority of the code for Vearn is open source. We firmly believe
    that open source development is essential within the blockchain environment,
    fostering transparency, collaboration, and trust among users and developers.
  </svelte:fragment>
</Accordion>

<Accordion title="Is the Vearn smart contract upgradable?">
  <svelte:fragment slot="body">
    No, the Vearn smart contract is not upgradable. Once deployed, the smart
    contract's logic remains immutable and cannot be altered. The only method
    for upgrading it would involve deploying a new contract and requesting all
    users to migrate to the new contract.
  </svelte:fragment>
</Accordion>

<Accordion title="What is the address of the Vearn contract?">
  <svelte:fragment slot="body">
    <a
      href={`${chain.explorers[0].url}/accounts/${chain.trader}`}
      target="_blank"
      rel="noreferrer"
      title="Vearn contract address"
    >
      {chain.trader}
      <NewTab class="h-6 inline" />
    </a>
  </svelte:fragment>
</Accordion>
