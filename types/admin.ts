// Types pour l'admin avec STRUCTURE ANGLAISE B29
// Plus d'incohérences FR-EN !

export interface Client {
  id: string;
  name: string;                    // ✅ Anglais cohérent
  sector: string;                  // ✅ Plus de confusion secteur/sector
  size: 'small' | 'medium' | 'large' | 'enterprise';  // ✅ Anglais
  primary_contact: {               // ✅ Plus contact_principal
    name: string;
    email: string;
    phone?: string;
  } | null;
  specific_context: string;        // ✅ Plus contexte_specifique
  status: 'active' | 'inactive' | 'pending';  // ✅ Plus statut
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Project {
  id: string;
  name: string;                    // ✅ Plus de confusion nom/name
  description: string;
  client_id: string;
  budget?: number;
  deadline?: string;
  priority: 'low' | 'normal' | 'high';
  status: 'active' | 'on_hold' | 'completed' | 'cancelled';  // ✅ Plus statut
  tags: string[];
  requirements: string[];
  squad_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  completed_at?: string;

  // Relations (avec structure anglaise)
  client_name?: string;            // ✅ Cohérent
  client_sector?: string;          // ✅ Plus d'erreur
}

export interface Squad {
  id: string;
  project_id: string;
  client_id: string;
  name: string;                    // ✅ Déjà en anglais
  description: string;
  status: 'active' | 'suspended' | 'archived';  // ✅ Cohérent
  agents_count: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  deleted_at?: string;

  // Relations (avec structure anglaise)
  project_name?: string;           // ✅ Cohérent
  client_name?: string;            // ✅ Cohérent
  client_sector?: string;          // ✅ Plus d'erreur
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}