<script lang="ts">
  export let theme: "light" | "dark" = "dark";
</script>

<hr
  class="border-b-1 {theme === 'dark' ? 'border-muted' : 'border-disabled'}"
/>
