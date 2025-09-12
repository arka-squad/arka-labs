// In-memory storage for clients when PostgreSQL is not available
// This is a fallback solution for demo/development purposes

interface ClientData {
  id: number | string;
  nom: string;
  email: string;
  metadata: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  deleted_at?: string | null;
}

// Store clients in memory (will be lost on server restart)
const clientsStore = new Map<string, ClientData>();

// Initialize with some demo data
const demoClients: ClientData[] = [
  {
    id: 'demo-1',
    nom: 'Arka Labs Demo',
    email: 'demo@arka-labs.com',
    metadata: {
      secteur: 'Technologie',
      taille: 'Startup',
      statut: 'actif',
      contact_principal: {
        nom: 'John Doe',
        email: 'demo@arka-labs.com',
        telephone: '+33 1 23 45 67 89',
        poste: 'CEO'
      },
      site_web: 'https://arka-labs.com',
      effectifs: 10
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system'
  },
  {
    id: 'demo-2',
    nom: 'Enterprise Corp',
    email: 'contact@enterprise.com',
    metadata: {
      secteur: 'Finance',
      taille: 'Grande entreprise',
      statut: 'actif',
      contact_principal: {
        nom: 'Jane Smith',
        email: 'contact@enterprise.com',
        telephone: '+33 1 98 76 54 32',
        poste: 'CTO'
      },
      site_web: 'https://enterprise.com',
      effectifs: 5000
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: 'system'
  }
];

// Initialize store with demo data
demoClients.forEach(client => {
  clientsStore.set(String(client.id), client);
});

export const clientsFallbackStore = {
  // Get all clients
  async getAll(filters?: {
    search?: string;
    statut?: string;
    taille?: string;
    secteur?: string;
  }): Promise<ClientData[]> {
    let clients = Array.from(clientsStore.values()).filter(c => !c.deleted_at);
    
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      clients = clients.filter(c => 
        c.nom.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters?.statut) {
      clients = clients.filter(c => c.metadata?.statut === filters.statut);
    }
    
    if (filters?.taille) {
      clients = clients.filter(c => c.metadata?.taille === filters.taille);
    }
    
    if (filters?.secteur) {
      const secteurLower = filters.secteur.toLowerCase();
      clients = clients.filter(c => 
        c.metadata?.secteur?.toLowerCase().includes(secteurLower)
      );
    }
    
    return clients.sort((a, b) => a.nom.localeCompare(b.nom));
  },

  // Get client by ID
  async getById(id: string): Promise<ClientData | null> {
    const client = clientsStore.get(String(id));
    if (client && !client.deleted_at) {
      return client;
    }
    return null;
  },

  // Create new client
  async create(data: {
    nom: string;
    email: string;
    metadata: any;
    created_by?: string;
  }): Promise<ClientData> {
    const id = String(Date.now());
    const client: ClientData = {
      id,
      nom: data.nom,
      email: data.email,
      metadata: data.metadata,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: data.created_by || 'system'
    };
    
    clientsStore.set(id, client);
    console.log('Client created in fallback store:', client);
    return client;
  },

  // Update client
  async update(id: string, data: {
    nom?: string;
    email?: string;
    metadata?: any;
  }): Promise<ClientData | null> {
    const client = clientsStore.get(String(id));
    if (!client || client.deleted_at) {
      return null;
    }
    
    if (data.nom !== undefined) client.nom = data.nom;
    if (data.email !== undefined) client.email = data.email;
    if (data.metadata !== undefined) client.metadata = data.metadata;
    client.updated_at = new Date().toISOString();
    
    clientsStore.set(String(id), client);
    console.log('Client updated in fallback store:', client);
    return client;
  },

  // Delete client (soft delete)
  async delete(id: string): Promise<boolean> {
    const client = clientsStore.get(String(id));
    if (!client || client.deleted_at) {
      return false;
    }
    
    client.deleted_at = new Date().toISOString();
    clientsStore.set(String(id), client);
    console.log('Client deleted in fallback store:', id);
    return true;
  },

  // Check if store is being used
  isActive(): boolean {
    return true; // Always active as fallback
  }
};