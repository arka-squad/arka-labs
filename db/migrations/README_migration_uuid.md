# SCHÉMA ARKA - Résumé avant migration UUID

## 📊 État actuel (13/09/2025)

### Tables principales:
- action_queue
- agent_credentials
- agent_events
- agent_instances
- agent_runs
- agent_templates
- agents
- auth_audit_logs
- clients
- documents
- lots_history
- lots_state
- messages
- project_agents
- project_assignments
- project_docs
- project_squads
- projects
- revoked_tokens
- squad_instructions
- squad_members
- squads
- thread_pins
- thread_state
- threads
- users
- webhook_dedup
- zz_proof

### ❌ Problème identifié:
- **projects.id**: INTEGER (IDs séquentiels 1,2,3... = faille sécurité)
- **autres tables**: UUID (sécurisé)

### 🎯 Migration requise:
1. projects.id INTEGER → UUID
2. Toutes références project_id INTEGER → UUID
3. APIs et frontend adaptés

### 📋 Tables avec project_id à migrer:
- agent_events.project_id (uuid)
- documents.project_id (integer)
- project_agents.project_id (integer)
- project_assignments.project_id (integer)
- project_docs.project_id (integer)
- project_squads.project_id (integer)
- squad_instructions.project_id (integer)
- threads.project_id (integer)

Voir le fichier SQL complet pour les détails techniques.
