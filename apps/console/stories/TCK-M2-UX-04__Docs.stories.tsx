import type { Meta, StoryObj } from "@storybook/react"; import { Dropzone } from "../src/ui/docs/Dropzone"; import { DocListItem } from "../src/ui/docs/DocListItem";
export default { title:"Documents/Dropzone+List" } as Meta;
export const Empty:  StoryObj = { render: ()=> <Dropzone onFiles={()=>{}} /> };
export const Drag:   StoryObj = { render: ()=> <Dropzone onFiles={()=>{}} state="drag" /> };
export const ErrorS: StoryObj = { render: ()=> <Dropzone onFiles={()=>{}} state="error" /> };
export const List:   StoryObj = { render: ()=> <ul className="rounded-xl border" style={{ borderColor: "#1F2A33" }}>
  <DocListItem name="Plan Directeur — Arka R1.pdf" tags={["cadre","AGP"]} />
  <DocListItem name="Spécifications Fonctionnelles — R1.docx" tags={["specs","PMO"]} />
</ul> };
