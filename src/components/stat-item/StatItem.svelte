<script lang="ts">
  export let primary: boolean = false;
  export let value: string | number = 0;
  export let label = "";
</script>

<!-- Mobile -->
<div class="block lg:hidden text-gray-300">
  <h6 class="text-base">
    {label}: <span class:text-primary={primary}>{value}</span>
  </h6>
</div>

<!-- Desktop -->
<div class="hidden lg:block text-center text-gray-300">
  <h6 class="text-2xl font-bold" class:text-primary={primary}>
    {value}
  </h6>
  <p class="text-sm font-medium tracking-widest uppercase lg:text-base">
    {label}
  </p>
</div>
