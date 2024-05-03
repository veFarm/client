<script lang="ts">
  import Twitter from "@/assets/Twitter.svelte";
  import Discord from "@/assets/Discord.svelte";
  import Github from "@/assets/Github.svelte";
</script>

<footer
  class="
    w-full mx-auto h-16
    flex flex-wrap items-center space-x-6 p-2 sm:px-6 sm:py-3
    text-sm text-gray-300 md:text-base
  "
  data-cy="footer"
>
  <a href="https://twitter.com/vearn_finance" target="_blank" rel="noreferrer" title="Twitter">
    <Twitter />
  </a>
  <a href="https://discord.gg/KSE8RaF8Ft" target="_blank" rel="noreferrer" title="Discord">
    <Discord />
  </a>
  <!-- <Github class="w-6" /> -->
</footer>
