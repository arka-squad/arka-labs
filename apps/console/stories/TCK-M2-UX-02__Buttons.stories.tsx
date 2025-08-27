import type { Meta, StoryObj } from "@storybook/react"; import { ButtonPrimary, ButtonSecondary } from "../src/ui/buttons/Button";
export default { title: "Buttons/Primary-Secondary", parameters:{ layout:"centered" } } as Meta;
export const Primary: StoryObj = { render: ()=> <ButtonPrimary>CTA Gradient</ButtonPrimary> };
export const Secondary: StoryObj = { render: ()=> <ButtonSecondary>Action</ButtonSecondary> };
export const Disabled: StoryObj = { render: ()=> <ButtonPrimary disabled>Disabled</ButtonPrimary> };
