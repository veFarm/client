<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";

  type $$Props = HTMLInputAttributes & {
    label?: string;
    id: string;
  };

  export let label = "";
  export let id: string;
</script>

<label for={id} class="text-body text-sm">
  {label}
  <div class="relative">
    <input
      {id}
      class="bg-gray-50 border border-gray-300 text-body text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      {...$$restProps}
    />
    <div
      class="absolute top-2.5 right-8 bg-gray-200 dark:bg-gray-800 px-1.5 rounded-sm"
    >
      <slot name="sufix" />
    </div>
  </div>
</label>
