<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { VariantProps } from "class-variance-authority";
  import { cva } from "class-variance-authority";
  import { Spinner } from "@/components/spinner";

  type ButtonVariantProps = VariantProps<typeof buttonVariants>;
  type $$Props = HTMLButtonAttributes &
    ButtonVariantProps & {
      loading?: boolean;
      "data-cy"?: string;
    };

  export let intent: ButtonVariantProps["intent"] = "secondary";
  export let size: ButtonVariantProps["size"] = "medium";
  export let fullWidth: ButtonVariantProps["fullWidth"] = false;
  export let disabled: ButtonVariantProps["disabled"] = false;
  export let loading: boolean = false;

  const buttonVariants = cva(["font-medium"], {
    variants: {
      intent: {
        primary: [
          "text-black",
          "bg-primary",
          "hover:bg-opacity-90",
          "disabled:bg-opacity-80",
        ],
        secondary: [
          "text-accent",
          "bg-secondary",
          "hover:bg-opacity-90",
          "disabled:bg-opacity-80",
        ],
        danger: [
          "text-accent",
          "border",
          "border-muted",
          "hover:border-danger",
          "hover:bg-danger",
          "hover:text-accent",
          "disabled:border-danger",
          "disabled:bg-danger",
          "disabled:bg-opacity-80",
          "disabled:text-accent",
        ],
        outline: ["text-accent", "border", "border-muted"],
      },
      size: {
        small: ["text-sm", "p-2", "px-3", "rounded"],
        medium: ["text-sm", "px-4", "py-2.5", "sm:px-5", "sm:py-3", "rounded"],
        large: [
          "text-base",
          "sm:text-lg",
          "font-bold",
          "px-4",
          "py-2.5",
          "sm:px-5",
          "sm:py-3",
          "rounded",
          "sm:rounded-lg",
        ],
      },
      fullWidth: {
        true: ["w-full"],
      },
      disabled: {
        true: ["cursor-default"],
      },
    },
  });
</script>

<button
  type="button"
  {disabled}
  on:click
  {...$$restProps}
  class={buttonVariants({
    intent,
    size,
    fullWidth,
    disabled,
    class: $$props.class,
  })}
>
  <div class="flex items-center justify-center">
  <slot />
  <div class="relative ml-1">
    {#if loading}<Spinner class="absolute w-0 -top-2.5" data-cy="spinner" />{/if}
  </div>
  </div>
</button>
