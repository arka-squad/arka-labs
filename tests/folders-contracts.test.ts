import { describe, it, expect } from '@jest/globals';

// Contract validation tests based on B15 specification

describe('Folders API Contracts', () => {
  const mockFolderResponse = {
    id: 'coworking-q4',
    title: 'Journée Coworking Q4',
    status: 'active',
    vision: {
      objectif: 'Organiser la journée coworking RH et produire un plan de formation Q4 validé',
      livrable: 'Synthèse écrite, planning clair, décisions validées',
      contraintes: ['Budget ≤ 1k€', 'Salle confirmée J-7', 'Documents Q3 disponibles'],
      succes: ['3 décisions actées', 'Planning assigné', 'Feedback collecté']
    },
    context: {
      guided_notes: [
        {
          id: 'ctx1',
          type: 'agent_question',
          content: 'Quel est le nombre de participants attendu?',
          agent: 'heloise-rh'
        },
        {
          id: 'ctx2',
          type: 'user_note',
          content: 'Attention sécurité incendie - sortie de secours côté est'
        }
      ],
      completion: 75
    },
    agents: [
      {
        id: 'heloise-rh',
        name: 'Héloïse RH',
        role: 'A',
        load: 65,
        status: 'active'
      },
      {
        id: 'agp-gate',
        name: 'AGP Gate',
        role: 'R',
        load: 20,
        status: 'available'
      }
    ],
    stats: {
      docs_total: 5,
      docs_tested: 3,
      agents_assigned: 2,
      roadmap_progress: 60
    },
    updated_at: '2025-09-08T10:00:00Z'
  };

  const mockDocumentsResponse = {
    items: [
      {
        id: 'doc.coworking.proc',
        title: 'Procédure Journée Coworking',
        type: 'procedure',
        owner: 'RH',
        status: 'pass',
        assigned_to: 'heloise-rh',
        raci_role: 'A',
        updated_at: '2025-09-08T10:00:00Z'
      }
    ],
    page: 1,
    limit: 20,
    total: 5
  };

  const mockAssignResponse = {
    folder_id: 'coworking-q4',
    agent_id: 'heloise-rh',
    role: 'A',
    assigned_docs: ['doc.coworking.proc', 'doc.checklist.materiel'],
    assigned_at: '2025-09-08T11:00:00Z'
  };

  const mockContextResponse = {
    folder_id: 'coworking-q4',
    context_id: 'ctx3',
    type: 'user_note',
    content: 'Pas disponible le vendredi',
    created_at: '2025-09-08T11:30:00Z'
  };

  const mockRoadmapResponse = {
    folder_id: 'coworking-q4',
    milestones: [
      {
        id: 'm1',
        title: 'Salle réservée',
        date: '2025-09-15',
        status: 'done'
      },
      {
        id: 'm2',
        title: 'Atelier coworking',
        date: '2025-09-22',
        status: 'pending'
      },
      {
        id: 'm3',
        title: 'Synthèse livrée',
        date: '2025-09-23',
        status: 'pending'
      }
    ],
    progress: 33,
    critical_path: ['m1', 'm2', 'm3']
  };

  describe('GET /api/folders/:id contract', () => {
    it('should match expected response shape', () => {
      expect(mockFolderResponse).toHaveProperty('id');
      expect(mockFolderResponse).toHaveProperty('title');
      expect(mockFolderResponse).toHaveProperty('status');
      expect(mockFolderResponse).toHaveProperty('vision');
      expect(mockFolderResponse).toHaveProperty('context');
      expect(mockFolderResponse).toHaveProperty('agents');
      expect(mockFolderResponse).toHaveProperty('stats');
      expect(mockFolderResponse).toHaveProperty('updated_at');
    });

    it('should have valid vision structure', () => {
      const { vision } = mockFolderResponse;
      expect(vision).toHaveProperty('objectif');
      expect(vision).toHaveProperty('livrable');
      expect(vision).toHaveProperty('contraintes');
      expect(vision).toHaveProperty('succes');
      expect(Array.isArray(vision.contraintes)).toBe(true);
      expect(Array.isArray(vision.succes)).toBe(true);
    });

    it('should have valid context structure', () => {
      const { context } = mockFolderResponse;
      expect(context).toHaveProperty('guided_notes');
      expect(context).toHaveProperty('completion');
      expect(Array.isArray(context.guided_notes)).toBe(true);
      expect(typeof context.completion).toBe('number');
      expect(context.completion).toBeGreaterThanOrEqual(0);
      expect(context.completion).toBeLessThanOrEqual(100);
    });

    it('should have valid agents structure', () => {
      const { agents } = mockFolderResponse;
      expect(Array.isArray(agents)).toBe(true);
      agents.forEach(agent => {
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('role');
        expect(agent).toHaveProperty('load');
        expect(agent).toHaveProperty('status');
        expect(['A', 'R', 'C', 'I']).toContain(agent.role);
      });
    });

    it('should have valid stats structure', () => {
      const { stats } = mockFolderResponse;
      expect(stats).toHaveProperty('docs_total');
      expect(stats).toHaveProperty('docs_tested');
      expect(stats).toHaveProperty('agents_assigned');
      expect(stats).toHaveProperty('roadmap_progress');
      expect(typeof stats.docs_total).toBe('number');
      expect(typeof stats.docs_tested).toBe('number');
      expect(typeof stats.agents_assigned).toBe('number');
      expect(typeof stats.roadmap_progress).toBe('number');
    });
  });

  describe('GET /api/folders/:id/documents contract', () => {
    it('should match expected pagination shape', () => {
      expect(mockDocumentsResponse).toHaveProperty('items');
      expect(mockDocumentsResponse).toHaveProperty('page');
      expect(mockDocumentsResponse).toHaveProperty('limit');
      expect(mockDocumentsResponse).toHaveProperty('total');
      expect(Array.isArray(mockDocumentsResponse.items)).toBe(true);
    });

    it('should have valid document items', () => {
      const { items } = mockDocumentsResponse;
      items.forEach(doc => {
        expect(doc).toHaveProperty('id');
        expect(doc).toHaveProperty('title');
        expect(doc).toHaveProperty('type');
        expect(doc).toHaveProperty('owner');
        expect(doc).toHaveProperty('status');
        expect(doc).toHaveProperty('updated_at');
        expect(['pass', 'warn', 'fail', 'untested']).toContain(doc.status);
      });
    });
  });

  describe('POST /api/folders/:id/assign contract', () => {
    it('should match expected response shape', () => {
      expect(mockAssignResponse).toHaveProperty('folder_id');
      expect(mockAssignResponse).toHaveProperty('agent_id');
      expect(mockAssignResponse).toHaveProperty('role');
      expect(mockAssignResponse).toHaveProperty('assigned_docs');
      expect(mockAssignResponse).toHaveProperty('assigned_at');
      expect(Array.isArray(mockAssignResponse.assigned_docs)).toBe(true);
      expect(['A', 'R', 'C', 'I']).toContain(mockAssignResponse.role);
    });
  });

  describe('POST /api/folders/:id/context contract', () => {
    it('should match expected response shape', () => {
      expect(mockContextResponse).toHaveProperty('folder_id');
      expect(mockContextResponse).toHaveProperty('context_id');
      expect(mockContextResponse).toHaveProperty('type');
      expect(mockContextResponse).toHaveProperty('content');
      expect(mockContextResponse).toHaveProperty('created_at');
      expect(['note', 'constraint', 'objective', 'agent_question', 'user_note'])
        .toContain(mockContextResponse.type);
    });
  });

  describe('GET /api/folders/:id/roadmap contract', () => {
    it('should match expected response shape', () => {
      expect(mockRoadmapResponse).toHaveProperty('folder_id');
      expect(mockRoadmapResponse).toHaveProperty('milestones');
      expect(mockRoadmapResponse).toHaveProperty('progress');
      expect(mockRoadmapResponse).toHaveProperty('critical_path');
      expect(Array.isArray(mockRoadmapResponse.milestones)).toBe(true);
      expect(Array.isArray(mockRoadmapResponse.critical_path)).toBe(true);
    });

    it('should have valid milestone structure', () => {
      const { milestones } = mockRoadmapResponse;
      milestones.forEach(milestone => {
        expect(milestone).toHaveProperty('id');
        expect(milestone).toHaveProperty('title');
        expect(milestone).toHaveProperty('date');
        expect(milestone).toHaveProperty('status');
        expect(['done', 'pending', 'blocked']).toContain(milestone.status);
      });
    });

    it('should have valid progress percentage', () => {
      const { progress } = mockRoadmapResponse;
      expect(typeof progress).toBe('number');
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    });
  });
});