import type { Meta, StoryObj } from "@storybook/react";
import { KpiMiniCard } from "../../../../src/ui/KpiMiniCard";

export default { title: "KPIs/KpiMiniCard", component: KpiMiniCard } as Meta<typeof KpiMiniCard>;
type Story = StoryObj<typeof KpiMiniCard>;

export const TTFT: Story = { args: { label: "TTFT", value: 680, unit: "ms", background: "var(--arka-grad-ttft)" } };
export const RTT: Story = { args: { label: "RTT", value: 1450, unit: "ms", background: "var(--arka-grad-rtt)" } };
export const Err: Story = { args: { label: "% Err", value: 1.2, unit: "%", background: "var(--arka-grad-err)" } };
