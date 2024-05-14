<script lang="ts">
  import { onMount } from "svelte";
  import ChevronDown from "@/assets/ChevronDown.svelte";

  let translateY = 0;
  let direction = 1;
  const bounceHeight = 10; // Adjust this value to change the bounce height

  function bounce() {
    translateY += 1 * direction;

    if (translateY >= bounceHeight || translateY <= -bounceHeight) {
      direction *= -1;
    }
  }

  onMount(() => {
    const interval = setInterval(bounce, 10); // Adjust this value to change the speed of the bounce

    return () => clearInterval(interval);
  });
</script>

<div class="box" style="transform: translateY({{ translateY }}px)">
  <div class="text-sm text-accent opacity-70">
    <p class="text-center">Scroll to learn more</p>
    <ChevronDown class="mx-auto" />
  </div>
</div>

<style>
  .box {
    position: relative;
    animation: bounce 2s infinite alternate;
  }

  @keyframes bounce {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(10px);
    }
  }
</style>
