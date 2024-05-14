<script lang="ts">
  import Loading from "@/assets/Loading.svelte";
</script>

<Loading
  {...$$restProps}
  class={`inline animate-spin w-5 h-5 ${$$props.class}`}
/>
