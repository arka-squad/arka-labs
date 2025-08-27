import type { Meta, StoryObj } from "@storybook/react";
import { ChatMessage } from "../../../../src/ui/ChatMessage";

export default { title: "Chat/Message", component: ChatMessage } as Meta<typeof ChatMessage>;
type Story = StoryObj<typeof ChatMessage>;

export const UserMsg: Story = { args: { role: "user", content: "Bonjour l’agent" } };
export const AgentMsg: Story = { args: { role: "agent", content: "Je stream la réponse…", streaming: true } };
export const SystemMsg: Story = { args: { role: "system", content: "Thread initialisé." } };
