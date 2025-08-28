'use client';
import { AgentEventsPanel } from '../../../components/AgentEventsPanel';

export default function AgentEventsPage({ params }: { params: { id: string } }) {
  return <AgentEventsPanel agentId={params.id} />;
}
