'use client';
import { useState } from 'react';

export default function ConsoleShell() {
  const [tab, setTab] = useState<
    'projects' | 'chat' | 'documents' | 'observabilite' | 'prompt-builder'
  >('projects');
  // TODO: nav + rendu conditionnel
  return <div />;
}
