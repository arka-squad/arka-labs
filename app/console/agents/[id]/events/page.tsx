'use client';
import { AgentEventsPanel } from '@console/AgentEventsPanel';

export default function AgentEventsPage({ params }: { params: { id: string } }) {
  return <AgentEventsPanel agentId={params.id} />;
}
