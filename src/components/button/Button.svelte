<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { VariantProps } from "class-variance-authority";
  import { cva } from "class-variance-authority";

  type ButtonVariantProps = VariantProps<typeof buttonVariants>;
  type $$Props = HTMLButtonAttributes & ButtonVariantProps;

  export let intent: ButtonVariantProps["intent"] = "secondary";
  export let size: ButtonVariantProps["size"] = "medium";
  export let fullWidth: ButtonVariantProps["fullWidth"] = false;
  export let disabled: ButtonVariantProps["disabled"] = false;

  const buttonVariants = cva(["font-bold"], {
    variants: {
      intent: {
        primary: [
          "text-black",
           "bg-primary",
            "hover:bg-primary-100",
             "border",
              "border-lime-500", // TODO: add to palette
            ],
        secondary: [
          "text-background",
          "bg-secondary",
          "hover:bg-secondary-100",
             "border",
              "border-violet-500", // TODO: add to palette
        ],
        danger: [
          "text-danger",
          "bg-body",
          "border-2",
          "border-danger",
          "hover:border-danger-100",
          "hover:bg-danger",
          "hover:text-body"
        ],
      },
      size: {
        small: ["text-sm", "p-2", "rounded-lg"],
        medium: ["text-base", "py-3", "px-6", "rounded-lg"],
      },
      fullWidth: {
        true: ["w-full"],
      },
      disabled: {
        true: [
          "cursor-not-allowed",
          "bg-disabled",
          "border-none",
          "text-accent",
          "hover:bg-disabled",
          "hover:text-accent",
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
</button>
