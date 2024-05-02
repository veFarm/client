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
          // "border",
          // "border-lime-400", // TODO: add to palette
          "hover:bg-primary-100",
          // "hover:border-primary",
        ],
        secondary: [
          "text-body",
          "bg-secondary",
          // "border",
          // "border-violet-400", // TODO: add to palette
          "hover:bg-secondary-100",
          // "hover:border-secondary",
        ],
        danger: [
          "text-body",
          "border",
          "border-muted", // TODO: add to palette
          // "hover:border-lime-400", // TODO: add to palette
          // "hover:bg-primary-100",
          // "hover:border-primary",
          "hover:border-danger-100",
          "hover:bg-danger",
          "hover:text-body",
        ],
        outline: [
          "text-body",
          "border",
          "border-muted", // TODO: add to palette
          // "hover:border-lime-400", // TODO: add to palette
          // "hover:bg-primary-100",
          // "hover:border-primary",
        ],
      },
      size: {
        small: ["text-sm", "p-2", "px-3", "rounded"],
        medium: ["text-sm", "py-3", "px-5", "rounded"],
        large: ["text-lg", "font-bold", "py-3", "px-5", "rounded-lg"],
      },
      fullWidth: {
        true: ["w-full"],
      },
      disabled: {
        true: [
          "cursor-not-allowed",
          "bg-disabled",
          "border-gray-400",
          "text-black",
          "hover:bg-disabled",
          "hover:text-body",
          "hover:border-gray-400",
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
  {#if loading}<Spinner data-cy="spinner" />{/if}
</button>
