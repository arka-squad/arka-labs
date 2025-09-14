/**
 * ARKA LABS - Global TypeScript Interfaces Unifiées
 * Schéma Anglais Uniforme post-normalisation Option A
 */

// ===== CLIENT TYPES =====
export interface Client {
  id: string;
  name: string;
  email: string;
  sector: string;
  size: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  } | string;
  contact_name: string;
  specific_context: string;
  status: 'active' | 'inactive' | 'prospect' | 'archived';
  projets_count: number;
  projets_actifs: number;
  created_at: string;
  created_by: string;
}

export interface CreateClientRequest {
  name: string;
  sector?: string;
  size?: 'TPE' | 'PME' | 'ETI' | 'GE';
  contact_principal?: {
    name: string;
    email: string;
    phone?: string;
    role?: string;
  };
  specific_context?: string;
  status?: 'active' | 'inactive' | 'prospect' | 'archived';
}

// ===== PROJECT TYPES =====
export interface Project {
  id: string;
  name: string;
  client: {
    id: string;
    name: string;
    sector: string;
  };
  status: 'draft' | 'active' | 'on_hold' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  budget: number;
  deadline: string;
  agents_count: number;
  squads_count: number;
  deadline_alert?: 'ok' | 'proche' | 'depassee';
  created_at: string;
  created_by: string;
}

export interface CreateProjectRequest {
  name: string;
  client_id: string;
  status?: 'draft' | 'active' | 'on_hold' | 'completed';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  budget?: number;
  deadline?: string;
}

// ===== AGENT TYPES =====
export interface Agent {
  id: string;
  name: string;
  role: string;
  domain: 'RH' | 'Tech' | 'Marketing' | 'Finance' | 'Ops';
  version: string;
  description: string;
  tags: string[];
  prompt_system: string;
  temperature: number;
  max_tokens: number;
  status: 'active' | 'inactive' | 'archived';
  projets_actifs: number;
  projets_total: number;
  squads_count: number;
  performance_score: number;
  created_at: string;
  created_by: string;
}

export interface CreateAgentRequest {
  name: string;
  role: string;
  domain: 'RH' | 'Tech' | 'Marketing' | 'Finance' | 'Ops';
  version: string;
  description?: string;
  tags?: string[];
  prompt_system?: string;
  temperature?: number;
  max_tokens?: number;
  status?: 'active' | 'inactive' | 'archived';
}

// ===== SQUAD TYPES =====
export interface Squad {
  id: string;
  name: string;
  slug: string;
  domain: string;
  status: 'active' | 'inactive' | 'archived';
  agents_count: number;
  projects_count: number;
  created_at: string;
  created_by: string;
}

export interface CreateSquadRequest {
  name: string;
  domain?: string;
  status?: 'active' | 'inactive' | 'archived';
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  trace_id?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
  filters_applied?: Record<string, any>;
}

// ===== FILTER TYPES =====
export interface ClientFilters {
  search?: string;
  status?: string;
  size?: string;
  sector?: string;
}

export interface ProjectFilters {
  search?: string;
  status?: string;
  priority?: string;
  client_id?: string;
}

export interface AgentFilters {
  search?: string;
  status?: string;
  domain?: string;
  role?: string;
}

export interface SquadFilters {
  search?: string;
  status?: string;
  domain?: string;
}

// ===== USER & AUTH TYPES =====
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  jti?: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

// ===== DATABASE TYPES =====
export interface DatabaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  deleted_at?: string | null;
}