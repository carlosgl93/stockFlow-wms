import type { Meta, StoryObj } from "@storybook/react";
import { withRouter } from "storybook-addon-remix-react-router";

import { getAddToCartHandler } from "utils";
import { ProductFixture } from "utils/fixtures";

import { CreateProductForm } from "./CreateProductForm";

const meta = {
  title: "modules/Products/CreateProductForm",
  component: CreateProductForm,
  decorators: [withRouter],
  parameters: {
    layout: "centered",
    msw: {
      handlers: [getAddToCartHandler()],
    },
  },
} satisfies Meta<typeof CreateProductForm>;

const product = ProductFixture.toStructure();

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ...product,
  },
};
