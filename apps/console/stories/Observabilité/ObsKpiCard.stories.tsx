import type { Meta, StoryObj } from "@storybook/react";
import { ObsKpiCard } from "../../src/ui/obs/ObsKpiCard";

export default { title: "Observabilité/ObsKpiCard", component: ObsKpiCard } as Meta<typeof ObsKpiCard>;

type Story = StoryObj<typeof ObsKpiCard>;

export const TTFT: Story = { args: { label: "TTFT", value: 680, unit: "ms", gradient: "var(--arka-grad-ttft)" } };
export const RTT: Story = { args: { label: "RTT", value: 1450, unit: "ms", gradient: "var(--arka-grad-rtt)" } };
export const Err: Story = { args: { label: "% Err", value: 1.2, unit: "%", gradient: "var(--arka-grad-err)" } };
