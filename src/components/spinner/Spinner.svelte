<script lang="ts">
  import Loading from "@/assets/Loading.svelte";
</script>

<Loading
  {...$$restProps}
  class={`inline animate-spin w-6 h-6 ${$$props.class}`}
/>
