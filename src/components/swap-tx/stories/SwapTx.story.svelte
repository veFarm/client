<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { SwapTx } from "..";

  type $$Props = ComponentProps<SwapTx>;
</script>

<SwapTx {...$$props}>I&apos;m the label</SwapTx>
