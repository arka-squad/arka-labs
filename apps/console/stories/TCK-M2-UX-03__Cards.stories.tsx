import type { Meta, StoryObj } from "@storybook/react"; import { CardProject } from "../src/ui/cards/CardProject"; import { CardKpi } from "../src/ui/cards/CardKpi"; import { ButtonPrimary, ButtonSecondary } from "../src/ui/buttons/Button";
export default { title:"Cards/Project+KPI" } as Meta;
export const Project: StoryObj = { render: ()=> (
  <CardProject name="Nova" last="il y a 2h" agents={3} right={<>
    <ButtonPrimary>Ouvrir chat</ButtonPrimary>
    <ButtonSecondary>Docs</ButtonSecondary>
  </>} />)};
export const KPI: StoryObj = { render: ()=> <div className="grid gap-4 sm:grid-cols-3">
  <CardKpi label="TTFT chat" value="680 ms" />
  <CardKpi label="RTT voix"  value="1450 ms" gradient="linear-gradient(135deg,#F25636 0%,#E0026D 100%)" />
  <CardKpi label="% erreurs" value="1.2 %" gradient="linear-gradient(135deg,#E0026D 0%,#E0026D 100%)" />
</div> };
