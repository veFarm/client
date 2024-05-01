<script lang="ts">
  export let title: string;
  export let body: string;
</script>

<div class="bg-success bg-opacity-[.14] px-5 py-3 rounded-lg text-success text-sm font-normal border border-success" {...$$restProps}>
  <h4 class="text-base font-bold text-success mb-2">{title}</h4>
  <p class="text-sm font-normal text-body">{body}</p>
</div>
