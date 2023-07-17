<script lang="ts">
  export let value = "";
  export let label = "";
</script>

<div class="text-center">
  <h6 class="text-2xl font-bold lg:text-3xl xl:text-4xl text-gray-300">
    {value}
  </h6>
  <p
    class="text-sm font-medium tracking-widest text-gray-300 uppercase lg:text-base"
  >
    {label}
  </p>
</div>
