import type { Meta, StoryObj } from "@storybook/react";
import { DocUploadPanel, type UploadedDoc } from "../src/ui/docs/DocUploadPanel";

export default { title: "Documents/DocUploadPanel", component: DocUploadPanel } as Meta<typeof DocUploadPanel>;

const sampleDocs: UploadedDoc[] = [
  {
    id: "1",
    name: "Plan Directeur — Arka R1.pdf",
    type: "application/pdf",
    size: 120 * 1024,
    tags: ["cadre", "AGP"],
  },
  {
    id: "2",
    name: "Notes.txt",
    type: "text/plain",
    size: 2 * 1024,
    tags: ["note"],
  },
];

export const Empty: StoryObj<typeof DocUploadPanel> = {
  args: { docs: [], onUpload: async () => {}, onDelete: () => {} },
};

export const WithDocs: StoryObj<typeof DocUploadPanel> = {
  args: { docs: sampleDocs, onUpload: async () => {}, onDelete: () => {} },
};

export const ErrorState: StoryObj<typeof DocUploadPanel> = {
  args: { docs: [], onUpload: async () => {}, onDelete: () => {}, state: "error" },
};
