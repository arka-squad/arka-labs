import type { Meta, StoryObj } from "@storybook/react";
import { PromptBlock } from "../../../../src/ui/PromptBlock";

export default { title: "Prompt/Block", component: PromptBlock } as Meta<typeof PromptBlock>;
type Story = StoryObj<typeof PromptBlock>;

export const Editable: Story = { args: { titre: "Cadre Général", valeur: "Lorem ipsum", declencheur: "Auto" } };
export const Readonly: Story = { args: { titre: "Règles", valeur: "—", declencheur: "—", readOnly: true } };
