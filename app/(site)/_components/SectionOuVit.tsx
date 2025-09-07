import WorkspaceSlider, { type WorkspaceCardData } from './WorkspaceSlider';
import { LayoutDashboard, BookOpen, ClipboardList } from 'lucide-react';

export default function SectionOuVit() {
  const items: WorkspaceCardData[] = [
    { id: 'cockpit', title: 'Cockpit', desc: 'Chat, recettes, observabilité', icon: LayoutDashboard },
    { id: 'docs', title: 'Docs', desc: 'Prompts, contrats, versions', icon: BookOpen },
    { id: 'evidence', title: 'Evidence', desc: 'Paquets texte + empreintes', icon: ClipboardList },
  ];
  return <WorkspaceSlider items={items} />;
}

