<script lang="ts">
  export let value: string | number = 0;
  export let label = "";
</script>

<div class="text-center text-gray-300">
  <h6 class="text-2xl font-bold lg:text-3xl xl:text-4xl">
    {value}
  </h6>
  <p class="text-sm font-medium tracking-widest uppercase lg:text-base">
    {label}
  </p>
</div>
