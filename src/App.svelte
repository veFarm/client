<script lang="ts">
  import { onMount } from "svelte";
  // import { Connex } from "@vechain/connex";
  import { ConnexService } from "@/blockchain/connex-service";
  import { VTHO } from "@/blockchain/vtho";
  // import Big from "big.js";
  import { wallet } from "@/stores/wallet";
  import { Layout } from "@/components/layout";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { chain, VTHO_TOTAL_SUPPLY } from "./config";

  // const VTHO_CONTRACT_ADDRESS = import.meta.env.VITE_VTHO_CONTRACT_ADDRESS;
  const TRADER_CONTRACT_ADDRESS = import.meta.env.VITE_TRADER_CONTRACT_ADDRESS;

  if (TRADER_CONTRACT_ADDRESS == null) {
    throw new Error("Missing env var TRADER_CONTRACT_ADDRESS");
  }

  // TODO: either do this or call totalSupply
  // export const MAX_UINT256 = new Big(2).pow(256).sub(1);

  // See: https://blog.vechain.energy/how-to-swap-tokens-in-a-contract-c82082024aed

  // TODO
  // let ethers: any;
  // let Greeter: any;
  let greet = "";
  let newGreeting = "";
  let disabled = false;
  let error = "";
  let vthoTarget: number;
  let vthoLeft: number = 10;

  async function getAllowance(): Promise<string | undefined> {
    disabled = true;

    try {
      if ($wallet.account == null) {
        throw new Error("Wallet is not connected");
      }

      // TODO: pass current wallet config
      const connexService = new ConnexService({ noExtension: true });
      const vtho = new VTHO(connexService);

      const allowance = await vtho.allowance({
        owner: $wallet.account,
        spender: TRADER_CONTRACT_ADDRESS,
      });

      return allowance.decoded[0] as string;
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  /**
   * Give/revoke Trader allowance to spend VTHO.
   */
  async function handleApprove({
    amount,
    comment,
  }: {
    amount: string;
    comment: string;
  }): Promise<void> {
    disabled = true;

    try {
      if ($wallet.account == null) {
        throw new Error("Wallet is not connected");
      }

      // TODO: pass current wallet config
      const connexService = new ConnexService({ noExtension: true });
      const vtho = new VTHO(connexService);

      // const totalSupply = await vtho.totalSupply();
      // console.log({ totalSupply });

      const clause = vtho.approve({
        spender: TRADER_CONTRACT_ADDRESS,
        amount,
      });

      const tx = await connexService.signTx({
        clauses: [clause],
        signer: $wallet.account,
        comment,
      });
      console.log({ tx });

      const receipt = await connexService.waitForTx({ txID: tx.txid });
    } catch (_error: any) {
      error = _error?.message || "Unknown error occurred.";
    } finally {
      disabled = false;
    }
  }

  // async function getGreeting() {
  //   if (ethers == null) return;

  //   error = "";

  //   try {
  //     const provider = new ethers.providers.JsonRpcProvider(chain.rpc[0]);
  //     const greeter = new Greeter(provider);

  //     greet = await greeter.greet_();
  //   } catch (error_: any) {
  //     error = error_?.message || "Something went wrong when querying greeting";
  //   }
  // }

  // async function handleSubmit() {
  //   if ($wallet.provider == null || Greeter == null) return;

  //   disabled = true;
  //   error = "";

  //   try {
  //     const signer = $wallet.provider.getSigner();
  //     const greeter = new Greeter(signer);

  //     await greeter.setGreeting_(newGreeting);
  //     await getGreeting();
  //   } catch (error_: any) {
  //     error =
  //       error_?.message || "Something went wrong when setting a new greeting";
  //   } finally {
  //     disabled = false;
  //   }
  // }

  // async function handleSwitch() {
  //   error = "";

  //   try {
  //     await wallet.switchChain(chain.chainId);
  //   } catch (error_: any) {
  //     error = error_?.message || "Something went wrong when switching chains";
  //   }
  // }

  // onMount(async () => {
  //   // Lazy load ethers
  //   ethers = (await import("ethers")).ethers;
  //   Greeter = (await import("@/contracts/greeter")).Greeter;
  //   await getGreeting();
  // });
</script>

<Layout>
  <form
    class="flex flex-col space-y-4 border border-accent rounded-lg px-6 py-4 bg-background mt-8"
  >
    <h2 class="underline">Swap VTHO for VET automatically</h2>
    <Input
      type="number"
      id="vtho_left"
      label="Amount to be kept in wallet"
      bind:value={vthoLeft}
    >
      <svelte:fragment slot="sufix">VTHO</svelte:fragment>
    </Input>
    {#if $wallet.isConnected}
      <Button
        intent="primary"
        class="mx-auto"
        {disabled}
        fullWidth
        on:click={() => {
          handleApprove({
            amount: VTHO_TOTAL_SUPPLY,
            comment:
              "Allow our smart contract to spend your VTHO in exchange for VET.",
          });
        }}
      >
        Approve
      </Button>
    {:else}
      <ConnectWalletButton intent="primary" fullWidth />
    {/if}

    {#if error != null && error.length > 0}
      <p class="text-danger">{error}</p>
    {/if}

    <p class="text-center">Chain: {chain.name}</p>
  </form>

  <div
    class="flex flex-col space-y-4 border border-accent rounded-lg px-6 py-4 bg-background mt-8"
  >
    <h2 class="underline">Past Trades</h2>
  </div>
</Layout>
