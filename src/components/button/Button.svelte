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
          "disabled:bg-opacity-80"
        ],
        secondary: [
          "text-body",
          "bg-secondary",
          "hover:bg-opacity-90",
          "disabled:bg-opacity-80"
        ],
        danger: [
          "text-body",
          "border",
          "border-muted",
          "hover:border-danger",
          "hover:bg-danger",
          "hover:text-body",
          "disabled:border-danger",
          "disabled:bg-danger",
          "disabled:bg-opacity-80",
          "disabled:text-body",
        ],
        outline: [
          "text-body",
          "border",
          "border-muted",
        ],
      },
      size: {
        small: ["text-sm", "p-2", "px-3", "rounded"],
        medium: ["text-sm", "px-4", "py-2.5", "sm:px-5", "sm:py-3", "rounded"],
        large: ["text-base", "sm:text-lg", "font-bold", "px-4", "py-1.5", "sm:px-5", "sm:py-3", "rounded", "sm:rounded-lg"],
      },
      fullWidth: {
        true: ["w-full"],
      },
      disabled: {
        true: [
          "cursor-default",
        ],
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
  <slot />
  {#if loading}<Spinner class="ml-2" data-cy="spinner" />{/if}
</button>
