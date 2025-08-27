import type { Meta, StoryObj } from "@storybook/react"; import { PromptBlock } from "../src/ui/prompt/PromptBlock";
export default { title:"Prompt/Block" } as Meta;
export const Editable: StoryObj = { render: ()=> <PromptBlock titre="Cadre Général" valeur="Lorem ipsum" declencheur="Auto" role="owner" /> };
export const Readonly: StoryObj = { render: ()=> <PromptBlock titre="Règles" valeur="—" declencheur="—" role="viewer" /> };
