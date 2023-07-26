import type { Meta, StoryObj } from "@storybook/svelte";
import { Input } from "../";
import InputStory from "./Input.story.svelte";

// More on how to set up stories at: https://storybook.js.org/docs/7.0/svelte/writing-stories/introduction
const meta = {
  title: "components/Input",
  component: InputStory,
  tags: ["autodocs"],
  // argTypes: {
  //   backgroundColor: { control: "color" },
  //   size: {
  //     control: { type: "select" },
  //     options: ["small", "medium", "large"],
  //   },
  // },
} satisfies Meta<Input>;

export default meta;

type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/7.0/svelte/writing-stories/args
export const Default: Story = {
  render: (args) => ({
    Component: InputStory,
    props: args,
  }),
  args: {},
};

export const Error: Story = {
  render: (args) => ({
    Component: InputStory,
    props: args,
  }),
  args: {
    error: "Some error message",
  },
};
