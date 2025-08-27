import type { Meta, StoryObj } from "@storybook/react";
import { KpiMiniCard } from "../../../../src/ui/KpiMiniCard";

export default { title: "KPIs/KpiMiniCard", component: KpiMiniCard } as Meta<typeof KpiMiniCard>;
type Story = StoryObj<typeof KpiMiniCard>;

export const TTFT: Story = { args: { label: "TTFT", value: 680, unit: "ms", background: "linear-gradient(135deg,#FAB652 0%,#F25636 50%)" } };
export const RTT: Story = { args: { label: "RTT", value: 1450, unit: "ms", background: "linear-gradient(135deg,#F25636 0%,#E0026D 100%)" } };
export const Err: Story = { args: { label: "% Err", value: 1.2, unit: "%", background: "linear-gradient(135deg,#E0026D 0%,#E0026D 100%)" } };
