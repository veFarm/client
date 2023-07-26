<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { Input } from "..";

  type $$Props = ComponentProps<Input>;
</script>

<Input id="test" label="I'm the label" value="Some value" {...$$props} />
