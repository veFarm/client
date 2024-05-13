<script lang="ts">
  import zap from "../../public/zap.svg";
</script>

<div class="text-xl sm:text-2xl font-bold" {...$$props}>
  <img src={zap} class="inline -mt-1 -mr-1" />
  <!-- <span class="v-color">V</span><span class="text-primary">earn</span> -->
  <span class="text-xl">Vearn Finance</span>
</div>

<style>
  /* .v-color {
    color: rgb(178, 178, 178);
  } */
  span {
    background: rgb(255,255,255);
    background: linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,229,0,1) 60%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
