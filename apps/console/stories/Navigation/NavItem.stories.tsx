import type { Meta, StoryObj } from "@storybook/react";
import { NavItem, type NavItemProps } from "../../../../src/ui/NavItem";

export default { title: "Navigation/NavItem", component: NavItem } as Meta<NavItemProps>;
type Story = StoryObj<NavItemProps>;

export const Idle: Story = { args: { active: false, label: "Dashboard", href: '#' } };
export const Active: Story = { args: { active: true, label: "Chat", href: '#' } };
